# Build all services
$services = @("auth-service", "order-service", "payment-service", "delivery-service", "restaurant-service")

foreach ($service in $services) {
    Write-Host "Building $service..."
    docker build -t $service`:latest ./backend/$service
}

Write-Host "All services built successfully!" 