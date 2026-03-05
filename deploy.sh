#!/bin/bash

# AIHEALZ Deployment Script
# Deploys to Hostinger VPS with CyberPanel

set -e

# Configuration
SERVER_USER="root"
SERVER_IP="72.61.224.90"
SERVER_PORT="22"
DEPLOY_PATH="/home/aihealz.com/public_html"
APP_NAME="aihealz"

echo "🚀 Starting AIHEALZ deployment..."
echo "================================="

# Step 1: Install dependencies and build
echo ""
echo "📦 Step 1: Installing dependencies..."
npm ci --production=false

echo ""
echo "🔨 Step 2: Building application..."
npm run build

# Step 3: Sync files to server
echo ""
echo "📤 Step 3: Syncing files to server..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env.local' \
    --exclude '.next/cache' \
    -e "ssh -p ${SERVER_PORT}" \
    ./ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

# Step 4: Install production dependencies and restart on server
echo ""
echo "🔧 Step 4: Setting up server..."
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /home/aihealz.com/public_html

# Install production dependencies
echo "Installing production dependencies..."
npm ci --production

# Run database migrations
echo "Running database migrations..."
npx prisma generate
npx prisma migrate deploy

# Restart the application with PM2
echo "Restarting application..."
if pm2 describe aihealz > /dev/null 2>&1; then
    pm2 restart aihealz
else
    pm2 start npm --name "aihealz" -- start
fi

pm2 save

echo "Application restarted successfully!"
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo "================================="
echo "🌐 Site: https://aihealz.com"
