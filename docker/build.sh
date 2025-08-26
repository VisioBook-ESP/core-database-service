#!/bin/bash

# Visiobook Core Database Service - Docker Build Script
# This script builds the production Docker image with proper tagging

set -e

# Configuration
IMAGE_NAME="visiobook/core-database-service"
BUILD_CONTEXT="../"
DOCKERFILE_PATH="./Dockerfile"

# Get version from package.json
VERSION=$(node -p "require('../package.json').version")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build arguments
BUILD_ARGS=(
    --build-arg "VERSION=${VERSION}"
    --build-arg "GIT_COMMIT=${GIT_COMMIT}"
    --build-arg "BUILD_DATE=${BUILD_DATE}"
)

# Tags
TAGS=(
    "${IMAGE_NAME}:latest"
    "${IMAGE_NAME}:${VERSION}"
    "${IMAGE_NAME}:${VERSION}-${GIT_COMMIT}"
)

echo "🐳 Building Visiobook Core Database Service Docker Image"
echo "📦 Version: ${VERSION}"
echo "🔗 Git Commit: ${GIT_COMMIT}"
echo "📅 Build Date: ${BUILD_DATE}"
echo ""

# Build the image
echo "🔨 Building Docker image..."
docker build \
    "${BUILD_ARGS[@]}" \
    -f "${DOCKERFILE_PATH}" \
    -t "${IMAGE_NAME}:latest" \
    "${BUILD_CONTEXT}"

# Apply additional tags
for tag in "${TAGS[@]:1}"; do
    echo "🏷️  Tagging as: ${tag}"
    docker tag "${IMAGE_NAME}:latest" "${tag}"
done

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📋 Available tags:"
for tag in "${TAGS[@]}"; do
    echo "   - ${tag}"
done

echo ""
echo "🚀 To run the container:"
echo "   docker run -p 3000:3000 --env-file ../.env ${IMAGE_NAME}:latest"
echo ""
echo "🔍 To inspect the image:"
echo "   docker inspect ${IMAGE_NAME}:latest"
echo ""
echo "📊 Image size:"
docker images "${IMAGE_NAME}:latest" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
