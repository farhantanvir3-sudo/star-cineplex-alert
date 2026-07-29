#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build Next.js
npm run build

# Ensure the Puppeteer cache directory exists
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Install Puppeteer and download Chrome
npx puppeteer browsers install chrome

# Ensure the project build cache directory exists before copying
mkdir -p /opt/render/project/src/.cache/puppeteer/chrome/

# Store/pull Puppeteer cache with build cache
if [[ ! -d $PUPPETEER_CACHE_DIR/chrome ]]; then
  echo "...Copying Puppeteer Cache from Build Cache"
  cp -R /opt/render/project/src/.cache/puppeteer/chrome/ $PUPPETEER_CACHE_DIR
else
  echo "...Storing Puppeteer Cache in Build Cache"
  cp -R $PUPPETEER_CACHE_DIR /opt/render/project/src/.cache/puppeteer/
fi
