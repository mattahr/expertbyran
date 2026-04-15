#!/bin/sh
# Init script to seed data directory if empty

DATA_DIR="${DATA_DIR:-/app/data}"
SEED_DIR="/app/seed"

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"
mkdir -p "$DATA_DIR/blog/posts"

# Check if data directory is empty or missing site-data.json
if [ ! -f "$DATA_DIR/site-data.json" ]; then
    echo "[init] Seeding data directory from $SEED_DIR"

    # Copy JSON files
    if [ -f "$SEED_DIR/site-data.json" ]; then
        cp "$SEED_DIR/site-data.json" "$DATA_DIR/site-data.json"
        echo "[init] Copied site-data.json"
    fi

    if [ -f "$SEED_DIR/blog-data.json" ]; then
        cp "$SEED_DIR/blog-data.json" "$DATA_DIR/blog-data.json"
        echo "[init] Copied blog-data.json"
    fi

    # Copy blog posts
    if [ -d "$SEED_DIR/blog/posts" ]; then
        cp -r "$SEED_DIR/blog/posts/"* "$DATA_DIR/blog/posts/" 2>/dev/null || true
        echo "[init] Copied blog posts"
    fi

    echo "[init] Data directory seeded successfully"
else
    echo "[init] Data directory already initialized, skipping seed"
fi

# Start the Next.js server
exec node server.js
