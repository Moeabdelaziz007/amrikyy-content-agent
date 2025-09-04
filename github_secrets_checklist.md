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
