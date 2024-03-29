require "db"
require "pg"
require "log"

# Wrapper around postgres database connections pool that handle migrations
class Database

  MIGRATIONS = {{run "./ct_dump_migrations.cr", "#{__DIR__}/migrations"}}
  
  @database : DB::Database
  delegate :close, :query_one, :query_one?, :query_all, :exec, :transaction, to: @database 
  
  def initialize(connection_parameters : String)
    @database = DB.open("postgres://#{connection_parameters}")
    @database.exec <<-SQL
      CREATE TABLE IF NOT EXISTS migrations (
        version INT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        finished_at TIMESTAMPTZ NOT NULL
      )
    SQL

    done = @database.query_all <<-SQL, as: Int32
      SELECT version FROM migrations
    SQL

    MIGRATIONS.sort_by(&.first).each do |(version, name, text)|
      if !done.includes? version
        begin
          Log.info &.emit "Running migration #{version}: #{name}"
          @database.transaction do |transaction|
            # Litte PG specific trickery, hopefully exec_all will reach DB on day
            transaction.connection.as(PG::Connection).exec_all text
            transaction.connection.exec <<-SQL, version, name, Time.utc
              INSERT INTO migrations (version, name, finished_at) VALUES ($1, $2, $3)
            SQL
          end
          Log.info &.emit "Migration #{version}: #{name} ran with success"
        rescue ex
          Log.error exception: ex, &.emit "Migration #{version}: #{name} FAILED"
          raise ex
        end
      end
    end    
  end
  
end
