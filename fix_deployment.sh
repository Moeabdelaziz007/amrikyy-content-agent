#!/bin/bash

# Deployment Fix Script for amrikyy-content-agent
# This script addresses common deployment issues found during debugging

set -e  # Exit on error

echo "🔧 DEPLOYMENT FIX SCRIPT"
echo "========================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "firebase.json" ]]; then
    log_error "firebase.json not found. Please run this script from the project root."
    exit 1
fi

log_info "Starting deployment fixes..."

# 1. Fix Firebase Functions Node.js version compatibility
echo -e "\n${BLUE}📦 1. Fixing Node.js version compatibility${NC}"
if [[ -f "firebase.json" ]]; then
    # Update firebase.json to use Node.js 20
    sed -i 's/"runtime": "nodejs18"/"runtime": "nodejs20"/g' firebase.json
    log_success "Updated Firebase functions runtime to nodejs20"
else
    log_error "firebase.json not found"
fi

# 2. Create environment template file
echo -e "\n${BLUE}🔐 2. Creating environment configuration template${NC}"
cat > .env.example << 'EOF'
# Environment Variables Template
# Copy this to .env.local (for web app) or set in your deployment environment

# Required for AI functionality
OPENAI_API_KEY=sk-your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here (optional)

# Authentication
SIWE_JWT_SECRET=your-jwt-secret-here

# Feature flags
GEMINI_FEATURE_ENABLED=true
NEXT_PUBLIC_DEV_MODE=true

# Quota settings
QUOTA_BACKEND=firestore
QUOTA_WINDOW_MS=3600000
QUOTA_MAX_REQUESTS=50

# Firebase Functions URL (update PROJECT_ID)
FUNCTIONS_BASE_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/contentAgent

# For local development
# FUNCTIONS_BASE_URL=http://localhost:5001/PROJECT_ID/us-central1/contentAgent
EOF
log_success "Created .env.example template"

# 3. Create Firebase project setup helper
echo -e "\n${BLUE}🔥 3. Creating Firebase setup helper${NC}"
cat > setup_firebase.sh << 'EOF'
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
EOF
chmod +x setup_firebase.sh
log_success "Created Firebase setup helper (setup_firebase.sh)"

# 4. Create GitHub Actions secrets checklist
echo -e "\n${BLUE}🚀 4. Creating GitHub Actions secrets checklist${NC}"
cat > github_secrets_checklist.md << 'EOF'
# GitHub Actions Secrets Checklist

Configure these secrets in your GitHub repository settings:

## Required Secrets

### Firebase Deployment
- `FIREBASE_TOKEN` - Get with: `firebase login:ci`

### Vercel Deployment  
- `VERCEL_TOKEN` - Get from Vercel dashboard > Account Settings > Tokens

### API Keys
- `OPENAI_API_KEY` - Your OpenAI API key
- `SIWE_PRIVATE_KEY` - Your SIWE JWT secret (for authentication)

## How to Add Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with the exact name listed above

## Verification

Run the deployment workflow manually to test:
1. Go to Actions tab in your repository
2. Select "deploy" workflow
3. Click "Run workflow"
4. Choose branch and run

## Troubleshooting

- **Firebase Token**: Run `npx firebase login:ci` to get the token
- **Vercel Token**: Must have deployment permissions
- **API Keys**: Ensure they have the correct format and permissions
EOF
log_success "Created GitHub secrets checklist (github_secrets_checklist.md)"

# 5. Create deployment test script
echo -e "\n${BLUE}🧪 5. Creating deployment test script${NC}"
cat > test_deployment.sh << 'EOF'
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
EOF
chmod +x test_deployment.sh
log_success "Created deployment test script (test_deployment.sh)"

# 6. Create package-lock.json for web app if missing
echo -e "\n${BLUE}📋 6. Checking package-lock.json files${NC}"
if [[ ! -f "apps/web/package-lock.json" ]]; then
    log_warning "Web app package-lock.json missing - this may cause deployment issues"
    log_info "Consider running: cd apps/web && npm install to generate it"
fi

# 7. Update .gitignore to include generated files
echo -e "\n${BLUE}📝 7. Updating .gitignore${NC}"
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
    cat >> .gitignore << 'EOF'

# Environment variables
.env.local
.env

# Deployment helpers (optional - remove if you want to commit them)
github_secrets_checklist.md
EOF
    log_success "Updated .gitignore with environment files"
fi

# 8. Summary and next steps
echo -e "\n${GREEN}🎉 DEPLOYMENT FIXES COMPLETED${NC}"
echo -e "\n${BLUE}📋 NEXT STEPS:${NC}"
echo "1. 🔐 Set up environment variables:"
echo "   cp .env.example .env.local"
echo "   # Edit .env.local with your actual values"

echo -e "\n2. 🔥 Configure Firebase:"
echo "   ./setup_firebase.sh"

echo -e "\n3. 📦 Install dependencies (if needed):"
echo "   cd apps/web && npm install"

echo -e "\n4. 🧪 Test deployment:"
echo "   ./test_deployment.sh"

echo -e "\n5. 🚀 Configure GitHub secrets:"
echo "   cat github_secrets_checklist.md"

echo -e "\n6. 🌐 Deploy:"
echo "   git tag v1.0.1"
echo "   git push origin v1.0.1"

log_success "All deployment fixes applied! Check the files created for next steps."