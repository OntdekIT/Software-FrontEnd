#!/usr/bin/env bash

set -e

IMAGE_TAG="ontdekstation-client-release"
VERSION="${1-latest}"

# script takes an optional tag argument, otherwise uses "latest"
docker build \
    -f Dockerfile.release \
    -t "$IMAGE_TAG:$VERSION" .

echo "$IMAGE_TAG:$VERSION"
