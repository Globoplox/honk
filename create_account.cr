# Quick script for creating user, using the same prehash method as the extension.

require "base64"
require "digest/sha256"
require "http/client"
require "json"

username = ARGV[0]
password = ARGV[1]
digest = OpenSSL::Digest.new("SHA256").update("#{username}HONK HONK#{password}").hexfinal
digest.bytesize
payload = {"name" => username, "password" => digest}
payload.to_json
pp HTTP::Client.post("https://honk.lan/user", body: payload.to_json, headers: HTTP::Headers{"Content-Type" => "application/json; charset=utf-8"})
