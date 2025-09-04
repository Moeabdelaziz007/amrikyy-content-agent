#!/usr/bin/env node

/**
 * Deployment Debug Script
 * Analyzes common deployment issues for the amrikyy-content-agent project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 DEPLOYMENT DEBUG REPORT\n');
console.log('=' .repeat(50));

// Check project structure
console.log('\n📁 PROJECT STRUCTURE:');
const requiredFiles = [
    'firebase.json',
    'package.json', 
    'apps/web/package.json',
    'functions/content_agent/package.json',
    '.github/workflows/deploy.yml'
];

requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check Node.js version compatibility  
console.log('\n🔧 NODE.JS VERSION COMPATIBILITY:');
try {
    const nodeVersion = process.version;
    console.log(`Current Node.js version: ${nodeVersion}`);
    
    // Check firebase.json for runtime
    const firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
    const requiredRuntime = firebaseConfig.functions?.runtime || 'Unknown';
    console.log(`Firebase functions runtime: ${requiredRuntime}`);
    
    const isCompatible = nodeVersion.startsWith('v18') || requiredRuntime === 'nodejs18';
    console.log(`${isCompatible ? '✅' : '⚠️'} Version compatibility: ${isCompatible ? 'OK' : 'Warning - version mismatch'}`);
} catch (error) {
    console.log(`❌ Error checking versions: ${error.message}`);
}

// Check dependencies installation
console.log('\n📦 DEPENDENCIES CHECK:');
const checkDeps = (dir, name) => {
    const nodeModulesPath = path.join(dir, 'node_modules');
    const packageJsonPath = path.join(dir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
        const hasNodeModules = fs.existsSync(nodeModulesPath);
        console.log(`${hasNodeModules ? '✅' : '❌'} ${name}: ${hasNodeModules ? 'Dependencies installed' : 'No node_modules found'}`);
        
        if (hasNodeModules) {
            try {
                const stats = fs.statSync(nodeModulesPath);
                const items = fs.readdirSync(nodeModulesPath);
                console.log(`   📊 ${items.length} packages installed`);
            } catch (e) {
                console.log(`   ⚠️ Error reading node_modules: ${e.message}`);
            }
        }
    } else {
        console.log(`❌ ${name}: No package.json found`);
    }
};

checkDeps('.', 'Root');
checkDeps('apps/web', 'Web App');  
checkDeps('functions/content_agent', 'Functions');

// Check Firebase configuration
console.log('\n🔥 FIREBASE CONFIGURATION:');
try {
    execSync('npx firebase --version', {stdio: 'pipe'});
    console.log('✅ Firebase CLI installed');
    
    const hasFirebaserc = fs.existsSync('.firebaserc');
    console.log(`${hasFirebaserc ? '✅' : '❌'} .firebaserc: ${hasFirebaserc ? 'Found' : 'Missing - run firebase use --add'}`);
    
    try {
        const result = execSync('npx firebase projects:list', {stdio: 'pipe', encoding: 'utf8'});
        console.log('✅ Firebase authentication OK');
    } catch (authError) {
        console.log('❌ Firebase not authenticated - run firebase login');
    }
} catch (error) {
    console.log('❌ Firebase CLI not available');
}

// Check environment variables
console.log('\n🔐 ENVIRONMENT VARIABLES:');
const requiredEnvVars = [
    'OPENAI_API_KEY',
    'SIWE_JWT_SECRET',
    'FUNCTIONS_BASE_URL'
];

requiredEnvVars.forEach(envVar => {
    const exists = !!process.env[envVar];
    console.log(`${exists ? '✅' : '❌'} ${envVar}: ${exists ? 'Set' : 'Missing'}`);
});

// Check GitHub Actions secrets (can't verify directly, just list requirements)
console.log('\n🚀 GITHUB ACTIONS REQUIREMENTS:');
const requiredSecrets = [
    'VERCEL_TOKEN',
    'FIREBASE_TOKEN', 
    'OPENAI_API_KEY',
    'SIWE_PRIVATE_KEY'
];

console.log('Required GitHub secrets:');
requiredSecrets.forEach(secret => {
    console.log(`   🔑 ${secret}`);
});

// Check build readiness
console.log('\n🏗️ BUILD READINESS:');
const checkBuildCommand = (dir, command, name) => {
    try {
        const packageJsonPath = path.join(dir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const hasScript = packageJson.scripts && packageJson.scripts[command];
            console.log(`${hasScript ? '✅' : '❌'} ${name}: ${command} script ${hasScript ? 'exists' : 'missing'}`);
        }
    } catch (error) {
        console.log(`❌ ${name}: Error checking scripts - ${error.message}`);
    }
};

checkBuildCommand('apps/web', 'build', 'Web App');
checkBuildCommand('functions/content_agent', 'deploy', 'Functions');

console.log('\n' + '='.repeat(50));
console.log('🎯 NEXT STEPS:\n');

console.log('1. Install missing dependencies:');
console.log('   cd apps/web && npm install');
console.log('   cd functions/content_agent && npm install');

console.log('\n2. Configure Firebase:');
console.log('   npx firebase login');
console.log('   npx firebase use --add');

console.log('\n3. Set environment variables for local development:');
console.log('   export OPENAI_API_KEY=your_key');  
console.log('   export SIWE_JWT_SECRET=your_secret');
console.log('   export FUNCTIONS_BASE_URL=http://localhost:5001/PROJECT_ID/us-central1/contentAgent');

console.log('\n4. Test builds:');
console.log('   cd apps/web && npm run build');
console.log('   npx firebase emulators:start');

console.log('\n5. Configure GitHub secrets for deployment');
console.log('   Add required secrets in GitHub repository settings');

console.log('\n📋 Report complete!');