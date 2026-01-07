#!/bin/bash

CONTAINER_NAME="dime-to-dozen-local-db"
POSTGRES_PASSWORD="postgrespassword"
POSTGRES_PORT="5432"

# stop/remove existing container and volume if they exist
docker rm -f $CONTAINER_NAME 2>/dev/null
docker volume rm ${CONTAINER_NAME}_data 2>/dev/null

set -e

# run new postgres container
docker run -d \
    --name $CONTAINER_NAME \
    -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    -p $POSTGRES_PORT:5432 \
    -v ${CONTAINER_NAME}_data:/var/lib/postgresql/data \
    postgres:17

start_time=$(date +%s)
while true; do
    if docker exec $CONTAINER_NAME pg_isready -U postgres > /dev/null 2>&1; then
        break
    fi
    elapsed=$(( $(date +%s) - start_time ))
    if [ $elapsed -gt 30 ]; then
        echo "Postgres did not become available after 30 seconds. Dumping container logs:"
        docker logs $CONTAINER_NAME
        exit 1
    fi
    echo "Waiting for Postgres to be available..."
    sleep 1
done

echo "Postgres is up and running on port $POSTGRES_PORT"

export DATABASE_URL="postgresql://postgres:$POSTGRES_PASSWORD@localhost:$POSTGRES_PORT/postgres"

deno run db:push

deno run sample-seed