#!/bin/sh
# Init script to seed data directory if empty

DATA_DIR="${DATA_DIR:-/app/data}"
SEED_DIR="/app/seed"

# Create data directories if they don't exist
mkdir -p "$DATA_DIR" "$DATA_DIR/blog/posts" "$DATA_DIR/foresight" "$DATA_DIR/radar"

# Copy a seed catalog file only if it does not already exist
seed_file() {
    if [ -f "$SEED_DIR/$1" ] && [ ! -f "$DATA_DIR/$1" ]; then
        cp "$SEED_DIR/$1" "$DATA_DIR/$1"
        echo "[init] Seeded $1"
    fi
}

# Copy files from a seed directory, skipping any that already exist
seed_dir() {
    [ -d "$SEED_DIR/$1" ] || return 0
    for src in "$SEED_DIR/$1"/*; do
        [ -e "$src" ] || continue
        dest="$DATA_DIR/$1/$(basename "$src")"
        if [ ! -e "$dest" ]; then
            cp "$src" "$dest"
        fi
    done
}

seed_file site-data.json
seed_file blog-data.json
seed_file foresight-data.json
seed_file radar-data.json

seed_dir blog/posts
seed_dir foresight
seed_dir radar

echo "[init] Data directory ready"

# Start the Next.js server
exec node server.js
