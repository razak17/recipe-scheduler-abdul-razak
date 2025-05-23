#!/bin/bash

# Build and start the development containers
docker-compose -f docker-compose.dev.yml up -d --build

# Show logs
docker-compose -f docker-compose.dev.yml logs -f
