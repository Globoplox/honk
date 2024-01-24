FROM golang:1.21.5-alpine
RUN apk add git
ENV GOPROXY=direct
WORKDIR /root
COPY . .
RUN go build .
CMD ["/root/honk"]
