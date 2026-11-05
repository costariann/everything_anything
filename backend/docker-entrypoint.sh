#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL database connection..."
MAX_RETRIES=30
RETRY_COUNT=0

until npx prisma db push --skip-generate; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "❌ Failed to connect to database after $MAX_RETRIES attempts. Exiting."
    exit 1
  fi
  echo "Database not ready yet. Retrying in 2 seconds ($RETRY_COUNT/$MAX_RETRIES)..."
  sleep 2
done

echo "✅ Database schema is synchronized."

echo "🌱 Running database seed (idempotent)..."
npm run seed || echo "⚠️ Seeding finished or skipped."

echo "🚀 Starting backend application..."
exec "$@"

