FROM crystallang/crystal:1.8.2-alpine
WORKDIR /root
COPY . .
RUN shards build honk-api --no-debug --verbose --no-color -p -s -t --error-trace
CMD ["/root/bin/honk-api"]
