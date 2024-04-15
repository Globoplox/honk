require "uuid/json"

class Api

  class User
    include JSON::Serializable
    include DB::Serializable
    
    @[JSON::Field(ignore_deserialize: true)]
    property id : UUID?
    property name : String
    @[JSON::Field(ignore_serialize: true)]
    property password : String

    def validate(errors = [] of Error, index = nil)
      index = index.try { |index| "[#{index}]" }
      errors.push Error.validation "name.too_short", "Must be at least 4 characters long" if name.size < 4
      errors.push Error.validation "name.too_long", "Must be at most 200 characters long" if name.size > 200
      errors.push Error.validation "password.too_short", "Must be at least 8 characters long" if password.size < 8
      errors
    end
  end

  route GET, "/login", def read_current_user(ctx)
    authorization = ctx.request.headers["Authorization"]?
    raise Error.new HTTP::Status::UNAUTHORIZED, "BadCredentials", "Missing authorization header" unless authorization
    auth_type, auth_payload = authorization.split ' '
    credentials = Base64.decode_string auth_payload
    username, password = credentials.split ':'
    user = @database.query_one? <<-SQL, username, &.read User
      SELECT id, name, password FROM users WHERE name = $1
    SQL
    raise Error.new HTTP::Status::UNAUTHORIZED, "BadCredentials", "Bad credentials" unless user
    password_match = Crypto::Bcrypt::Password.new(user.password).verify password
    raise Error.new HTTP::Status::UNAUTHORIZED, "BadCredentials", "Bad credentials" unless password_match
    token = UUID.random.to_s
    @cache.hmset "session:#{token}", {user_id: user.id.to_s}
    @cache.expire "session:#{token}", 10.minute.total_seconds.to_i
    ctx.response.headers["X-Auth-Token"] = token
    ctx << user
  end

  route POST, "/users", def create_user(ctx)
    user = ctx >> User
    errors = user.validate
    return ctx << Error::Validations.new errors unless errors.empty?
    hash = Crypto::Bcrypt::Password.create user.password, cost: PASSWORD_COST
    @database.exec <<-SQL, user.name, hash
      INSERT INTO users (name, password) VALUES ($1, $2)
    SQL
    ctx.status = HTTP::Status::CREATED
  end
end
