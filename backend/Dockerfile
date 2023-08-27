FROM golang:1.21

LABEL maintainer="darmiel <hi@d2a.io>"
LABEL org.opencontainers.image.source = "https://github.com/darmiel/dmp"

WORKDIR /usr/src/app
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install and cache dependencies (by @montanaflynn)
# https://github.com/montanaflynn/golang-docker-cache
COPY go.mod go.sum ./
RUN go mod graph | awk '{if ($1 !~ "@") print $2}' | xargs go get

# Copy remaining source
COPY /pkg ./pkg
COPY /api ./api
COPY main.go .
COPY go.mod .
COPY go.sum .

RUN go build -o dmp-backend main.go

COPY /firebase.json .
RUN ls -la

EXPOSE 8080

ENTRYPOINT [ "/usr/src/app/dmp-backend" ]
