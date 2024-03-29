require "uuid/json"

class Api

  class Password
    include JSON::Serializable
    include DB::Serializable
    
    @[JSON::Field(ignore_deserialize: true)]
    property id : UUID?
    
    property name : String
    property tags : Array(String)
    property data : String

    def validate(errors = [] of Error)
      errors.push Error.validation "name.too_short", "Must be at least 4 characters long" if name.size < 4
      errors.push Error.validation "name.too_long", "Must be at most 200 characters long" if name.size > 200
      tags.each_with_index do |tag, index|
        errors.push Error.validation "tag[#{index}].too_short", "Must be at least 2 characters long" if tag.size < 2
        errors.push Error.validation "tag[#{index}].too_long", "Must be at most 40 characters long" if tag.size > 40
      end
      errors
    end
  end

  route GET, "/passwords/:id", def read_password(ctx)
    self_id = authenticate ctx    
    ctx << @database.query_one <<-SQL, ctx.path_parameter("id"), self_id, &.read Password
      SELECT id, name, tags, data FROM password WHERE id = $1 AND user_id = $2 
    SQL
  end

  route DELETE, "/passwords/:id", def delete_password(ctx)
    self_id = authenticate ctx    
    @database.exec <<-SQL, ctx.path_parameter("id"), self_id
      DELETE FROM passwords WHERE id = $1 AND user_id = $2
    SQL
    ctx.status = HTTP::Status::NO_CONTENT
  end

  route GET, "/passwords", def search_password(ctx)
    self_id = authenticate ctx    
    terms = ctx.request.query_params["search"]?.try(&.split ' ', remove_empty: true) || [] of String
    ctx << @database.query_all <<-SQL, self_id, terms, &.read Password
      SELECT id, name, tags, data
      FROM passwords
      WHERE user_id = $1
        AND CASE
          WHEN ARRAY_LENGTH($2::varchar[], 1) IS NOT NULL
            THEN tags_match_score(tags, $2) > 0
          ELSE TRUE
        END
      ORDER BY CASE
        WHEN ARRAY_LENGTH($2::varchar[], 1) IS NOT NULL
          THEN tags_match_score(tags, $2)
        ELSE EXTRACT(EPOCH FROM created_at)
      END
      DESC
    SQL
  end

  route PUT, "/passwords/:id", def update_password(ctx)
    self_id = authenticate ctx
    password = ctx >> Password
    errors = password.validate
    return ctx << Error::Validations.new errors unless errors.empty?
    @database.exec <<-SQL, password.name, password.tags, password.data, ctx.path_parameter("id"), self_id
      UPDATE passwords SET name = $1, tags = $2, data = $3 WHERE id = $4 AND user_id = $5 
    SQL
    ctx.status = HTTP::Status::NO_CONTENT
  end

  route POST, "/passwords", def create_password(ctx)
    self_id = authenticate ctx
    password = ctx >> Password
    errors = password.validate
    return ctx << Error::Validations.new errors unless errors.empty?
    @database.exec <<-SQL, self_id, password.name, password.tags, password.data
      INSERT INTO passwords (user_id, name, tags, data) VALUES ($1, $2, $3, $4)
    SQL
    ctx.status = HTTP::Status::CREATED
  end
end
