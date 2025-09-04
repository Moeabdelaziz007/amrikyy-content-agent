#!/bin/bash
# Firebase Setup Helper

echo "🔥 Firebase Setup Helper"
echo "========================"

# Check if Firebase CLI is available
if ! command -v npx firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "🔐 Step 1: Login to Firebase"
npx firebase login

echo "📋 Step 2: List available projects"
npx firebase projects:list

echo "🎯 Step 3: Select project (you'll need to choose from the list above)"
read -p "Enter your Firebase project ID: " PROJECT_ID

npx firebase use --add $PROJECT_ID

echo "✅ Firebase setup complete!"
echo "📝 Next steps:"
echo "1. Update FUNCTIONS_BASE_URL in your environment variables"
echo "2. Set up GitHub secrets for deployment"
echo "3. Run: npx firebase emulators:start --only functions,firestore"
