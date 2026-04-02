#!/bin/sh
# Run integration and E2E tests in Docker Compose
set -e

docker-compose up -d db app

echo "Waiting for app and db to be ready..."
sleep 20

docker-compose run --rm test-runner

EXIT_CODE=$?

docker-compose down

exit $EXIT_CODE
