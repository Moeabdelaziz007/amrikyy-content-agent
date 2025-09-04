#!/bin/bash
# Deployment Test Script

set -e

echo "🧪 DEPLOYMENT TEST SCRIPT"
echo "========================="

# Test 1: Firebase Functions
echo -e "\n📦 Testing Firebase Functions build..."
cd functions/content_agent
if npm run deploy --dry-run 2>/dev/null; then
    echo "✅ Functions deployment test passed"
else
    echo "❌ Functions deployment test failed"
    echo "💡 Try: cd functions/content_agent && npm install"
fi
cd ../..

# Test 2: Web App Build (if dependencies are available)
echo -e "\n🌐 Testing Web App build..."
cd apps/web
if [[ -d "node_modules" ]] && [[ -f "node_modules/.bin/next" ]]; then
    if npm run build; then
        echo "✅ Web app build test passed"
    else
        echo "❌ Web app build test failed"
    fi
else
    echo "⚠️  Web app dependencies not fully installed"
    echo "💡 Try: cd apps/web && npm install"
fi
cd ../..

# Test 3: Firebase Emulators
echo -e "\n🔥 Testing Firebase Emulators..."
if npx firebase emulators:exec --only functions,firestore "echo 'Emulators started successfully'" 2>/dev/null; then
    echo "✅ Firebase emulators test passed"
else
    echo "❌ Firebase emulators test failed"
    echo "💡 Make sure Firebase project is configured (run ./setup_firebase.sh)"
fi

echo -e "\n✅ Deployment tests complete!"
