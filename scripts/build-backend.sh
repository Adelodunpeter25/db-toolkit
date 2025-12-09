#!/bin/bash
set -e

echo "Building Python backend..."

cd "$(dirname "$0")/../src/db-toolkit"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist build

# Activate virtual environment and build
echo "Building with PyInstaller..."
source .venv/bin/activate
pyinstaller build.spec

echo "Backend build complete!"
ls -lh dist/db-toolkit-backend/
