#!/usr/bin/env bash

set -e

IMAGE_TAG="ontdekstation-client-build"
VERSION="${1-latest}"

# script takes an optional tag argument, otherwise uses "latest"
docker build \
    -f Dockerfile.build \
    -t "$IMAGE_TAG:$VERSION" .

echo "$IMAGE_TAG:$VERSION"
