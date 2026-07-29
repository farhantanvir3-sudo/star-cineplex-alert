#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing Chromium dependencies for Puppeteer..."

# Install standard required packages for Chromium
apt-get update
apt-get install -y \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2 \
  libxshmfence1 \
  fonts-liberation \
  libappindicator3-1 \
  xdg-utils

echo "Installing Node dependencies..."
npm install

echo "Generating Prisma Client..."
npx prisma generate

echo "Building Next.js app..."
npm run build
