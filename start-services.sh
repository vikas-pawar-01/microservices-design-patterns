#!/bin/bash

# Navigate to directory containing service files
# cd /path/to/your/service/directory

# Start Order Service
node order-service.js &

# Start Payment Service
node payment-service.js &

sleep 5

node sendOrder.js &
