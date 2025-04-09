# Stage 1: Build the Go application
# Use a Go version that matches or exceeds go.mod requirement (>= 1.24.2)
FROM golang:1.24-alpine AS builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the Go app as a static binary
# CGO_ENABLED=0 prevents the build from linking against C libraries.
# -a flag forces rebuilding of packages that are already up-to-date.
# -installsuffix cgo allows us to statically link dependencies.
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/server ./main.go

# Stage 2: Create the final, minimal image
FROM alpine:latest

# Add ca-certificates to make TLS/SSL calls possible
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy only the built executable from the builder stage
COPY --from=builder /app/server .

# Expose port 8080 to the outside world (ensure this matches your Gin server config in main.go)
EXPOSE 8080

# Command to run the executable
CMD ["./server"] 