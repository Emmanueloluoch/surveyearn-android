#!/bin/bash
# SurveyEarn — APK Builder
# Run this from the Replit shell: bash artifacts/surveypesa-mobile/build-apk.sh

set -e

echo ""
echo "======================================"
echo "  SurveyEarn — APK Build Script"
echo "======================================"
echo ""

# Check that the deployed API URL has been set
if grep -q "REPLACE_WITH_YOUR_DEPLOYED_API_URL" artifacts/surveypesa-mobile/eas.json; then
  echo "⚠️  ACTION NEEDED:"
  echo ""
  echo "  You must set your deployed API URL in eas.json first."
  echo "  Open: artifacts/surveypesa-mobile/eas.json"
  echo "  Replace: REPLACE_WITH_YOUR_DEPLOYED_API_URL"
  echo "  With your Replit deployed URL, e.g.: https://myproject.replit.app"
  echo ""
  exit 1
fi

echo "✅  API URL is configured."
echo ""

# Install EAS CLI if not present
if ! command -v eas &> /dev/null; then
  echo "📦  Installing EAS CLI..."
  npm install -g eas-cli --quiet
fi

echo "🔑  Log in to your free Expo account (expo.dev):"
echo "    (Create one free at https://expo.dev/signup if you don't have one)"
echo ""
cd artifacts/surveypesa-mobile

eas login

echo ""
echo "🔨  Starting APK build (this runs in the cloud, takes ~5 min)..."
echo ""
eas build --platform android --profile preview --non-interactive

echo ""
echo "✅  Build started! You will receive a download link above."
echo "    Download the .apk file and upload it to your website."
echo ""
