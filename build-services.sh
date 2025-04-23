#!/bin/bash

# Build all services
services=("auth-service" "order-service" "payment-service" "delivery-service" "restaurant-service")

for service in "${services[@]}"; do
    echo "Building $service..."
    docker build -t $service:latest ./backend/$service
done

echo "All services built successfully!" 