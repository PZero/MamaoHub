#!/bin/bash

echo "Setting up MaMaoDash Server..."

# Install dependencies
cd /home/pi/MaMaoHub
npm install

# Enable and start the service
sudo cp system/services/mamao-dashboard.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mamao-dashboard.service
sudo systemctl restart mamao-dashboard.service

echo "MaMaoDash is now running at http://localhost:8080"
