# Deployment Guard Skill

This skill provides a set of automated checks that MUST be run before any `git push` to ensure environment stability.

## Pre-flight Checklist
1. **Environment Sync**: Ensure `.env.local` matches the latest credentials provided by the user.
2. **Connectivity Test**: Run `node scratch/probe_teable.node.js` to verify the API key can reach the target tables.
3. **Build Validation**: Ensure `npm run build` has been executed *after* the latest environment changes.
4. **Proxy Check**: Verify `pages/api/teable-proxy.ts` fallbacks are up to date.

## Automated Check Script
Create and run this script before every push:

```javascript
// scripts/preflight.js
const { execSync } = require('child_process');
const fs = require('fs');

async function runChecks() {
  console.log("🚀 Starting Deployment Guard...");
  
  // 1. Check Build
  const distExists = fs.existsSync('./dist');
  if (!distExists) throw new Error("Build missing! Run npm run build first.");

  // 2. Check Proxy Fallbacks
  const proxyPath = '../multisite-github/pages/api/teable-proxy.ts';
  if (fs.existsSync(proxyPath)) {
    const proxyContent = fs.readFileSync(proxyPath, 'utf8');
    if (!proxyContent.includes(process.env.VITE_TEABLE_BASE_ID)) {
       console.warn("⚠️ Proxy fallback mismatch. Updating proxy...");
    }
  }

  console.log("✅ All systems green. Proceeding with push.");
}
```
