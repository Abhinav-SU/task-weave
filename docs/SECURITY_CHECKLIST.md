# 🔒 Security Checklist - Production Deployment

## Pre-Deployment Security Audit

### ✅ Environment Variables & API Keys
- [x] All API keys redacted from `.env` files
- [x] `.env` files added to `.gitignore` with `.env.*` patterns
- [x] `env.example` contains only placeholder values
- [x] No hardcoded API keys in source code
- [x] JWT secrets are strong (min 32 characters)
- [ ] **ACTION REQUIRED**: Rotate all API keys before public release
  - [ ] Generate new OpenAI API key at https://platform.openai.com/api-keys
  - [ ] Generate new Google AI API key at https://makersuite.google.com/app/apikey
  - [ ] Generate new JWT secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### ✅ Version Control
- [x] `.gitignore` comprehensive (env files, secrets, database files)
- [x] Test scripts moved to `scripts/` folder
- [x] Documentation organized in `docs/` folder
- [x] Archive folder excluded from tracking
- [ ] **ACTION REQUIRED**: Verify no sensitive files tracked
  ```powershell
  git status
  git add --dry-run .
  git log --all --full-history -- "**/.env"
  ```

### ✅ Database Security
- [ ] **ACTION REQUIRED**: Database credentials configuration
  - [ ] Use strong PostgreSQL password (not `taskweave_pass`)
  - [ ] Create dedicated database user with minimal privileges
  - [ ] Enable SSL/TLS for database connections in production
  - [ ] Set `DATABASE_URL` with production credentials in `.env`

### ✅ Authentication & Authorization
- [x] JWT authentication implemented
- [x] Password hashing with bcrypt
- [ ] **ACTION REQUIRED**: Security enhancements
  - [ ] Set secure cookie flags (`httpOnly`, `secure`, `sameSite`)
  - [ ] Implement rate limiting on auth endpoints
  - [ ] Add account lockout after failed login attempts
  - [ ] Configure CORS for production frontend domain

### ✅ API Security
- [ ] **ACTION REQUIRED**: Production API configuration
  - [ ] Update `CORS_ORIGIN` to production frontend URL
  - [ ] Enable HTTPS (TLS/SSL certificates)
  - [ ] Implement API rate limiting
  - [ ] Add request size limits
  - [ ] Enable security headers (helmet.js)

### ✅ Frontend Security
- [x] No hardcoded API keys in frontend code
- [x] API URLs use environment variables (`VITE_API_URL`, `VITE_WS_URL`)
- [ ] **ACTION REQUIRED**: Production build
  - [ ] Set production `VITE_API_URL` and `VITE_WS_URL`
  - [ ] Enable production mode (`NODE_ENV=production`)
  - [ ] Minify and optimize build
  - [ ] Configure Content Security Policy (CSP)

### ✅ Browser Extension Security
- [x] No hardcoded credentials in extension code
- [ ] **ACTION REQUIRED**: Extension preparation
  - [ ] Review and update manifest permissions
  - [ ] Test content script injection security
  - [ ] Validate storage API usage (encrypted data)

### ✅ Dependencies & CVEs
- [ ] **ACTION REQUIRED**: Dependency audit
  ```powershell
  cd backend; npm audit
  cd ../frontend/taskweave-flow-main; npm audit
  cd ../../extension; npm audit
  ```
- [ ] Update vulnerable dependencies
- [ ] Review license compatibility

### ✅ Logging & Monitoring
- [ ] **ACTION REQUIRED**: Production logging
  - [ ] Remove console.log statements from production code
  - [ ] Configure structured logging (Winston, Pino)
  - [ ] Set up error tracking (Sentry, etc.)
  - [ ] Ensure logs don't contain sensitive data

## Exposed Credentials - Fixed ✅

### Previously Exposed (NOW REDACTED)
| Location | Type | Status |
|----------|------|--------|
| `backend/.env` | OpenAI API Key (sk-proj-...) | ✅ REDACTED |
| `backend/.env` | Google API Key (AIzaSy...) | ✅ REDACTED |
| `backend/test-gemini.js` | Hardcoded Google API Key | ✅ REMOVED |

**CRITICAL**: These keys were exposed in the repository. After deployment:
1. ✅ Keys have been redacted from files
2. ⚠️ **Rotate these keys immediately** - they may be compromised
3. ✅ `.gitignore` updated to prevent future exposure

## Production Deployment Checklist

### Environment Setup
```bash
# 1. Clone repository
git clone <your-repo-url>
cd TaskWeave

# 2. Backend setup
cd backend
npm install
cp env.example .env
# Edit .env with production values

# 3. Database setup
docker-compose up -d postgres
npm run db:migrate

# 4. Frontend setup
cd ../frontend/taskweave-flow-main
npm install
# Create .env.production with VITE_API_URL

# 5. Build frontend
npm run build
```

### Configuration Validation
- [ ] All environment variables set in production `.env`
- [ ] Database migrations completed successfully
- [ ] CORS configured for production domain
- [ ] SSL/TLS certificates installed
- [ ] WebSocket endpoint accessible
- [ ] Health check endpoint responding

### Security Headers (Helmet.js)
Add to `backend/src/index.ts`:
```typescript
import helmet from '@fastify/helmet';

// After creating Fastify instance
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});
```

### Rate Limiting
Add to `backend/src/index.ts`:
```typescript
import rateLimit from '@fastify/rate-limit';

await app.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes',
});
```

## Ongoing Security Practices

### Regular Audits
- [ ] Monthly `npm audit` checks
- [ ] Quarterly dependency updates
- [ ] Review access logs weekly
- [ ] Monitor API usage patterns

### Incident Response
- [ ] Document procedure for key rotation
- [ ] Backup and recovery plan tested
- [ ] Security contact email configured
- [ ] Incident response team identified

### Compliance
- [ ] Review data privacy requirements (GDPR, etc.)
- [ ] Terms of Service and Privacy Policy published
- [ ] User data retention policy documented

## Emergency Key Rotation Procedure

If API keys are compromised:

1. **Immediate Actions**
   ```bash
   # Revoke compromised keys
   # OpenAI: https://platform.openai.com/api-keys
   # Google AI: https://makersuite.google.com/app/apikey
   ```

2. **Generate New Keys**
   - Create new API keys in respective platforms
   - Generate new JWT secrets

3. **Update Production**
   ```bash
   # SSH to production server
   vim /path/to/backend/.env
   # Update keys
   pm2 restart taskweave-backend
   ```

4. **Verify**
   - Test API functionality
   - Check error logs
   - Monitor for unauthorized usage

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Fastify Security Recommendations](https://www.fastify.io/docs/latest/Reference/Security/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

---

**Last Updated**: 2024-01-XX  
**Next Review**: Before production deployment  
**Security Contact**: your-security-email@domain.com
