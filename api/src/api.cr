require "http/server"
require "http/status"
require "crypto/bcrypt/password"
require "json"
require "redis"
require "cradix"
require "./database"

class Exception
  @[JSON::Field(ignore: true)]
  @cause : Exception?
  @[JSON::Field(ignore: true)]
  @callstack : CallStack?
end

class Api
  VERSION = {{ `shards version #{__DIR__}`.chomp.stringify }}

  class Error < Exception
    include JSON::Serializable  
    property code : HTTP::Status
    property error : String
    property message : String?

    def initialize(@code, @error, @message)
    end

    def self.validation(field, message)
      Error.new HTTP::Status::UNPROCESSABLE_ENTITY, field, message
    end

    class Validations < Error
      include JSON::Serializable
      property causes : Array(Error)
      def initialize(@causes : Array(Error))
        @code = HTTP::Status::UNPROCESSABLE_ENTITY
        @error = "Validation"
        @message = "Invalid body"
      end
    end
  end

  class Context
    property request : HTTP::Request
    property response : HTTP::Server::Response
    property path_parameters : Hash(String, String)?

    delegate :status, :status=, to: @response

    def >>(body : Type.class) : Type forall Type
      unless @request.headers["Content-Type"]? == "application/json"
        raise Error.new HTTP::Status::UNSUPPORTED_MEDIA_TYPE, "UnsupportedMediaType", "Expected application/json body" 
      end
      body.from_json @request.body || raise Error.new HTTP::Status::BAD_REQUEST, "BadRequest", "No body in request, expected a #{body}"
    end

    def <<(obj)
      case obj
      when Error then @response.status = obj.code
      end
      @response.content_type = "application/json"
      obj.to_json @response
    end

    def path_parameter(name)
      path_parameters.not_nil![name]
    end

    def initialize(ctx : HTTP::Server::Context)
      @request = ctx.request
      @response = ctx.response
    end
  end

  PASSWORD_COST = 8 # ~135ms on i7-7500U
  
  def initialize
    uri = ENV["BIND_URI"]
    @database = Database.new ENV["DB_PARAMETERS"]

    @cache = Redis::PooledClient.new(
      host: ENV["REDIS_HOST"],
      port: ENV["REDIS_PORT"].to_i,
      password: ENV["REDIS_PASSWORD"],
      pool_size: ENV["REDIS_POOL_SIZE"]?.try(&.to_i) || 20,
      pool_timeout: 1.seconds.total_seconds.to_i
    )


    ENV["CREATE_USER"]?.try do |username|
      password = ENV["CREATE_PASSWORD"]
      unless @database.query_one? "SELECT id FROM users WHERE name = $1", username, as: UUID
        Log.info &.emit "Creating user '#{username}'"
        # Password is prehashed by clients to prevent them to reach the server in clear text
        digest = OpenSSL::Digest.new("SHA256").update("#{username}HONK HONK#{password}").hexfinal
        hash = Crypto::Bcrypt::Password.create digest, cost: PASSWORD_COST
        @database.exec <<-SQL, username, hash
          INSERT INTO users (name, password) VALUES ($1, $2)
        SQL
      end
    end

    @router = Cradix(Context -> Nil).new
    
    @server = HTTP::Server.new do |ctx|
      t = Time.monotonic
      Log.info &.emit "#{ctx.request.method} #{ctx.request.path.rstrip '/'}"
      routes = @router.search "#{ctx.request.method}#{ctx.request.path.rstrip '/'}"
      ctx = Context.new ctx
      if routes.empty?
        ctx << Error.new HTTP::Status::NOT_FOUND, "NotFound", "Route #{ctx.request.method} #{ctx.request.path} was not found on this API."
      else
        handler, path_parameters = routes.first
        ctx.path_parameters = path_parameters
        begin
          handler.call ctx
        rescue error : Error
          ctx << error
        rescue ex
          Log.error exception: ex, &.emit "Exception handling route #{ctx.request.method}#{ctx.request.path.rstrip '/'}"
          if ENV["ENV"].in? ["dev", "local"]
            message = ex.message
          else
            message = "Something unexpected happened"
          end
          ctx << Error.new HTTP::Status::INTERNAL_SERVER_ERROR, "InternalServerError", message
        end
      end
      Log.info &.emit "TOOK: #{(Time.monotonic - t).total_milliseconds}ms"
    end

    _register_routes
    @server.bind uri: uri
  end

  def authenticate(ctx) : UUID
    token = ctx.request.cookies["__Host-session"]?.try &.value
    raise Error.new HTTP::Status::UNAUTHORIZED, "Not Logged In", "Not logged in" unless token
    hash = @cache.hgetall "session:#{token}"
    raise Error.new HTTP::Status::UNAUTHORIZED, "Not Logged In", "Not logged in" if hash.empty?
    @cache.expire "session:#{token}", 10.minute.total_seconds.to_i
    UUID.new hash["user_id"]
  end
  
  def start
    @server.listen
  end

  def terminate_gracefully
    @database.close
    @server.close
  end

  def _register_routes
  end

  def register(method, path, handler)
    @router.add "#{method}/#{path.strip '/'}", handler
  end

  macro route(http_method, path, method_def)
    {{method_def}}

    def _register_routes
      previous_def
      register {{http_method}}, {{path}}, ->{{method_def.name}}(Context)
    end
  end

  GET = "GET"
  POST = "POST"
  PUT = "PUT"
  PATCH = "PATCH"
  DELETE = "DELETE"
  
  route GET, "/version", def version(ctx)
    ctx << VERSION
  end
  
end

require "./routes/*"
