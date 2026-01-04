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

# wait for availability by repeatedly trying to run a simple select
until docker exec -it $CONTAINER_NAME pg_isready -U postgres > /dev/null 2>&1; do
    echo "Waiting for Postgres to be available..."
    sleep 1
done

echo "Postgres is up and running on port $POSTGRES_PORT"

export DATABASE_URL="postgresql://postgres:$POSTGRES_PASSWORD@localhost:$POSTGRES_PORT/postgres"

deno run db:push

deno run sample-seed