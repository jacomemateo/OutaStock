# ---- Build Stage ----
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Install git (needed for some Go deps)
RUN apk add --no-cache git

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binary
RUN go build -o server ./cmd/api/main.go


# ---- Run Stage ----
FROM alpine:latest

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/server .

# Expose port (Echo default is usually 8080)
EXPOSE 8080

# Run binary
CMD ["./server"]