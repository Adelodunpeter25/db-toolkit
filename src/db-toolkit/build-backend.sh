#!/bin/bash
# Build backend executable with PyInstaller

set -e

echo "Installing PyInstaller..."
uv pip install pyinstaller

echo "Building backend executable..."
pyinstaller backend.spec --clean --noconfirm

echo "Backend executable created at: dist/db-toolkit-backend"
