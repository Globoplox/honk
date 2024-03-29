require "log"

require "./api"

Api.new.tap do |api|
  Signal::TERM.trap do
    Log.info &.emit "Received sigterm, gracefully shutting down"
    api.terminate_gracefully
    Log.info &.emit "Shutting down"
  end
end.start
