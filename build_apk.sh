#!/bin/bash

# Brother Gold Cricket BAT Factory - APK Build Script
# This script builds the React Native Expo app for Android

echo "🚀 Brother Gold App Build Script"
echo "==============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if app.json exists
if [ ! -f "app.json" ]; then
    echo "❌ app.json not found. Please ensure you're in the correct directory."
    exit 1
fi

# Check if Firebase config is set up
if [ ! -f "src/services/firebase.js" ]; then
    echo "❌ Firebase configuration not found. Please set up Firebase first."
    exit 1
fi

echo "🔧 Checking Firebase configuration..."
# You should replace "YOUR_API_KEY" etc. with actual Firebase config values
# This is just a placeholder check
if grep -q "YOUR_API_KEY" src/services/firebase.js; then
    echo "⚠️  Warning: Firebase configuration contains placeholder values."
    echo "Please update src/services/firebase.js with your actual Firebase config."
fi

# Prebuild the project (if using Expo SDK 49+)
echo "🔨 Prebuilding project..."
npx expo prebuild

# Build APK
echo "🏗️  Building APK..."
expo build:android -t apk

echo ""
echo "✅ Build process initiated!"
echo ""
echo "📱 Once the build is complete, you can download the APK from the Expo build dashboard."
echo "🔗 The build URL will be provided in the terminal output above."
echo ""
echo "📝 Next steps:"
echo "1. Download the APK from the build URL"
echo "2. Install on your Android device"
echo "3. Test the app functionality"
echo ""
echo "🔧 For development, you can also run:"
echo "   npm start"
echo "   npm run android"
echo ""
echo "🎯 Brother Gold Cricket BAT Factory App"
echo "   Built with ❤️ for Pakistani cricket industry"