# OAuth Provider Setup Guide

This guide walks you through setting up OAuth applications for Google and GitHub to enable authentication in the AI Starter Template.

## Prerequisites

- Google account for Google Cloud Console access
- GitHub account for Developer Settings access
- Access to your project's environment variables

## Google OAuth Setup

### 1. Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 2. Create or Select a Project
- **New Project**: Click "Create Project"
  - Name: "AI Starter Template" (or your preferred name)
  - Organization: Leave as default or select your organization
  - Click "Create"
- **Existing Project**: Select from the dropdown at the top

### 3. Configure OAuth Consent Screen
1. Navigate to "APIs & Services" → "OAuth consent screen"
2. Choose **"External"** (unless you have a Google Workspace account)
3. Fill in the required information:
   - **App name**: "AI Starter Template"
   - **User support email**: Your email address
   - **App domain** (optional): Leave empty for development
   - **Developer contact information**: Your email address
4. Click "Save and Continue"
5. **Scopes**: Click "Save and Continue" (no additional scopes needed)
6. **Test users**: Add your email for testing, click "Save and Continue"
7. **Summary**: Review and click "Back to Dashboard"

### 4. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose **"Web application"**
4. Configure the OAuth client:
   - **Name**: "AI Starter Auth Client"
   - **Authorized JavaScript origins**: Leave empty
   - **Authorized redirect URIs**: Add these URLs:
     ```
     http://localhost:4321/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google
     ```
   - For production, add: `https://yourdomain.com/api/auth/callback/google`
5. Click "Create"

### 5. Save Your Google Credentials
You'll receive:
- **Client ID**: Starts with numbers and ends with `.apps.googleusercontent.com`
- **Client Secret**: A random string

⚠️ **Save these immediately** - you'll need them for environment variables.

## GitHub OAuth Setup

### 1. Access GitHub Developer Settings
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Sign in to your GitHub account

### 2. Create New OAuth App
1. Click "New OAuth App" (or "Register a new application")
2. Fill in the application details:
   - **Application name**: "AI Starter Template"
   - **Homepage URL**: `http://localhost:4321` (for development)
   - **Application description**: "AI-powered chat application with authentication" (optional)
   - **Authorization callback URL**: `http://localhost:4321/api/auth/callback/github`

### 3. Additional Configuration (Optional)
- For multiple development ports, you can update the callback URL later
- For production, you'll update the URLs to your actual domain

### 4. Register the Application
1. Click "Register application"
2. You'll be redirected to your new OAuth app's settings

### 5. Generate Client Secret
1. On your OAuth app page, find the "Client secrets" section
2. Click "Generate a new client secret"
3. **Copy the secret immediately** - GitHub only shows it once!

### 6. Save Your GitHub Credentials
You'll have:
- **Client ID**: Visible on the app settings page
- **Client Secret**: The secret you just generated

## Environment Variables Configuration

### 1. Copy Environment Template
```bash
cp .env.example .env.local
```

### 2. Update Your `.env.local` File
Add your OAuth credentials:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# GitHub OAuth  
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here

# BetterAuth Configuration
BETTER_AUTH_SECRET=your-super-secret-key-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:4321
```

### 3. Generate BetterAuth Secret
Generate a secure secret key (at least 32 characters):
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Using online generator
# Visit https://generate-secret.vercel.app/32
```

## Production Configuration

### 1. Update Redirect URLs
When deploying to production, update your OAuth applications:

**Google Cloud Console**:
- Add: `https://yourdomain.com/api/auth/callback/google`

**GitHub OAuth App**:
- Update Homepage URL: `https://yourdomain.com`
- Update Authorization callback URL: `http://localhost:4321/api/auth/callback/github`

### 2. Environment Variables for Production
Update your production environment with:
- Same OAuth credentials (Client IDs and Secrets)
- Production `BETTER_AUTH_URL`: `https://yourdomain.com`
- Strong `BETTER_AUTH_SECRET` (different from development)

## Testing Your Setup

### 1. Start Development Server
```bash
bun dev
```

### 2. Test OAuth Flow
1. Navigate to `http://localhost:4321/login`
2. Click "Sign in with Google" or "Sign in with GitHub"
3. Complete the OAuth flow
4. Verify you're redirected back to your application

### 3. Check for Issues
Common problems:
- **Redirect URI mismatch**: Ensure URLs match exactly in OAuth app settings
- **Client secret not set**: Check environment variables are loaded correctly
- **OAuth consent screen**: Ensure it's configured and published

## Security Best Practices

### 1. Protect Your Credentials
- Never commit `.env.local` to version control
- Use different secrets for development and production
- Regularly rotate client secrets

### 2. Configure Authorized Domains
- In production, restrict OAuth to your actual domain
- Remove development URLs from production OAuth apps
- Use HTTPS in production

### 3. Monitor OAuth Usage
- Enable logging in Google Cloud Console
- Monitor OAuth app usage in GitHub settings
- Set up alerts for unusual authentication patterns

## Troubleshooting

### Common OAuth Errors

**"redirect_uri_mismatch"**:
- Check that redirect URLs in OAuth apps match your BetterAuth configuration
- Ensure no trailing slashes in URLs

**"invalid_client"**:
- Verify Client ID and Client Secret are correct
- Check environment variables are properly loaded

**"access_denied"**:
- User cancelled OAuth flow - this is normal
- Check OAuth consent screen is properly configured

### Getting Help

If you encounter issues:
1. Check browser developer console for error messages
2. Verify environment variables with `console.log` (remove before committing)
3. Test OAuth URLs directly in browser
4. Consult BetterAuth documentation: https://better-auth.com
5. Check Google/GitHub OAuth documentation for specific provider issues

## Next Steps

After completing OAuth setup:
1. Test the complete authentication flow
2. Verify user data is properly stored in Convex
3. Test logout and session management
4. Configure additional OAuth providers if needed
5. Set up authentication monitoring and analytics