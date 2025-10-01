#!/bin/bash

# Script to update ngrok URL in the manifest and configuration files
# Usage: ./update-ngrok-url.sh https://new-ngrok-url.ngrok-free.app

if [ $# -eq 0 ]; then
    echo "Usage: $0 <ngrok-url>"
    echo "Example: $0 https://basically-enough-clam.ngrok-free.app"
    exit 1
fi

NGROK_URL=$1

# Remove trailing slash if present
NGROK_URL=${NGROK_URL%/}

echo "Updating ngrok URL to: $NGROK_URL"

# Update manifest file
sed -i.bak "s|\"url\": \".*\"|\"url\": \"$NGROK_URL\"|g" public/tonconnect-manifest.json
sed -i.bak "s|\"iconUrl\": \".*\"|\"iconUrl\": \"$NGROK_URL/icon-192x192.png\"|g" public/tonconnect-manifest.json

# Update TonConnect configuration
sed -i.bak "s|manifestUrl=\".*\"|manifestUrl=\"$NGROK_URL/tonconnect-manifest.json\"|g" src/routes/__root.tsx

echo "Updated files:"
echo "- public/tonconnect-manifest.json"
echo "- src/routes/__root.tsx"

echo "Backup files created with .bak extension"
echo "Don't forget to restart your development server!"