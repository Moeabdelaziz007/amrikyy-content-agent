# amrikyy-content-agent

Production-ready monorepo to run the Content Agent (AI content generation) with:
- Next.js (App Router), Tailwind
- wagmi + viem, SIWE
- Firebase Cloud Functions runtime + alternative Node/Fastify API
- Firestore DB
- OpenAI integration (GPT-4 / GPT-3.5)

## Requirements
- Node.js 20+
- Firebase CLI (`npm i -g firebase-tools`)
- GCP project (for deployment)
- OpenAI API Key

## Env Vars
- SIWE_JWT_SECRET
- OPENAI_API_KEY
- GEMINI_API_KEY (optional, for Gemini integration)
- GEMINI_FEATURE_ENABLED=true (to enable Gemini)
- QUOTA_BACKEND=firestore (for persistent quotas)
- QUOTA_WINDOW_MS=3600000 (1 hour window)
- QUOTA_MAX_REQUESTS=50 (requests per window)
- FUNCTIONS_BASE_URL
- NEXT_PUBLIC_DEV_MODE=true (for local testing)

## Local Development

Install deps:
```
pushd apps/web && npm i && popd
pushd apps/api && npm i && popd
pushd functions/content_agent && npm i && popd
```

Run Firebase emulators:
```
firebase emulators:start --only functions,firestore
```

Run web (dev):
```
cd apps/web
export NEXT_PUBLIC_DEV_MODE=true
export FUNCTIONS_BASE_URL=http://localhost:5001/PROJECT_ID/us-central1/contentAgent
export SIWE_JWT_SECRET=dev-secret
npm run dev
```

Run alternative API:
```
cd apps/api
export SIWE_JWT_SECRET=dev-secret
export OPENAI_API_KEY=sk-REPLACE_ME
npm run dev
```

Run tests:
```
# Unit
cd tests/unit && pip install pytest && pytest -q
# E2E (requires web)
cd tests/e2e && npm init -y && npm i -D @playwright/test && npx playwright install && npx playwright test
```

## CI / CD (GitHub Actions)

### Continuous Integration (ci.yml)
- **Triggers**: Every push to `main` branch or pull request
- **Actions**:
  - TypeScript type checking
  - Build verification
  - Unit tests (Python)
  - E2E tests (Playwright)
- **Status**: Ensures code quality before merge

### Continuous Deployment (deploy.yml)
- **Triggers**: 
  - Manual dispatch (workflow_dispatch)
  - Git tags (v*.*.* format)
- **Actions**:
  - Deploy Next.js app to Vercel
  - Deploy Firebase Functions
  - Run smoke tests
- **Required Secrets**:
  - `VERCEL_TOKEN`
  - `FIREBASE_TOKEN` 
  - `OPENAI_API_KEY`
  - `SIWE_PRIVATE_KEY`

### Deployment Commands
```bash
# Create and push a new release
git tag v1.0.0
git push origin v1.0.0

# Or trigger manual deployment from GitHub Actions UI
```

## Security & Ops
- Rotate `SIWE_JWT_SECRET` and `OPENAI_API_KEY` via Secret Manager.
- Firestore rules restrict reads/writes to the authenticated user.

## NEXT STEPS
1. Configure Firebase project and start emulators:
```
npm i -g firebase-tools
firebase login
firebase use --add
firebase emulators:start --only functions,firestore
```
2. Run the web app and dev login:
```
cd apps/web
export NEXT_PUBLIC_DEV_MODE=true
export FUNCTIONS_BASE_URL=http://localhost:5001/PROJECT_ID/us-central1/contentAgent
export SIWE_JWT_SECRET=dev-secret
npm run dev
```
3. Set CI secrets and deploy:
- Add `VERCEL_TOKEN`, `FIREBASE_TOKEN`, `OPENAI_API_KEY`, `SIWE_PRIVATE_KEY` in GitHub.
- Deploy functions:
```
cd functions/content_agent
npm i
SIWE_JWT_SECRET=... OPENAI_API_KEY=... firebase deploy --only functions:contentAgent
```


## Project Report (Files and Statuses)

Generate a comprehensive report about project files and statuses (Git) using the built-in script.

Quick usage (human-readable text):
```
python3 scripts/project_report.py --format text
```

Generate Markdown report and save to file:
```
python3 scripts/project_report.py --format md --output PROJECT_REPORT.md
```

Include heavy directories (node_modules/.next/dist) if you need a full inventory:
```
python3 scripts/project_report.py --format md --include-node-modules --output PROJECT_REPORT_FULL.md
```

JSON output for tooling:
```
python3 scripts/project_report.py --format json --output project_report.json
```

Notes:
- By default, heavy directories like node_modules, .next, dist, build, .terraform, etc. are excluded to keep the report fast.
- Git status is included when the repo is inside a Git work tree and git is available on PATH.
- Run from repo root (default) or pass a custom root: `--root /path/to/repo`.
