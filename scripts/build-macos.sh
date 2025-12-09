#!/bin/bash
set -e

echo "Building DB Toolkit for macOS..."

cd "$(dirname "$0")/.."

# Build backend first
echo "Step 1: Building backend..."
./scripts/build-backend.sh

# Clean frontend builds
echo "Step 2: Cleaning frontend builds..."
rm -rf src/db-toolkit-ui/src-tauri/target
rm -rf src/db-toolkit-ui/src-tauri/resources

# Copy backend to resources
echo "Step 3: Copying backend to resources..."
mkdir -p src/db-toolkit-ui/src-tauri/resources
cp -r src/db-toolkit/dist/db-toolkit-backend src/db-toolkit-ui/src-tauri/resources/

# Build Tauri app
echo "Step 4: Building Tauri app..."
cd src/db-toolkit-ui
npm run tauri build

echo ""
echo "Build complete!"
echo "App location: src/db-toolkit-ui/src-tauri/target/release/bundle/"
