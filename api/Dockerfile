FROM golang:1.21.4-alpine
WORKDIR /root
COPY . .
RUN go build .
CMD ["/root/honk"]
