# OAuth Setup Guide

## Google OAuth Configuration

### 1. Supabase Dashboard Configuration

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** provider
4. **IMPORTANT:** The callback URL is automatically set to:
```
https://jnkvrfuhffiuhzbdnipj.supabase.co/auth/v1/callback
```
**DO NOT CHANGE THIS** - This is the correct Supabase OAuth callback URL.

### 4. Testing OAuth

1. Start your development server: `npm run dev`
2. Navigate to your app URL (e.g., `http://10.236.187.240:8080`)
3. Click "Masuk dengan Google"
4. Complete the OAuth flow
5. You should be redirected back to your app

### 5. How OAuth Flow Works

1. **User clicks "Login with Google"**
2. **Redirect to Google OAuth** → User authenticates with Google
3. **Google redirects to Supabase** → `https://jnkvrfuhffiuhzbdnipj.supabase.co/auth/v1/callback`
4. **Supabase processes OAuth** → Creates/updates user session
5. **Supabase redirects to your app** → `http://10.236.187.240:8080/` (for IP addresses)
6. **App handles the redirect** → Processes the session and shows authenticated state

### 6. Troubleshooting

**Issue: "Invalid Redirect: must end with a public top-level domain"**
- **Solution:** This is expected for IP addresses. The app now handles this automatically by redirecting to home page instead of callback URL.

**Issue: "This site can't be reached" error**
- **Solution:** Make sure you're using the correct Supabase callback URL in Google Cloud Console

**Issue: OAuth consent screen issues**
- **Solution:** Configure OAuth consent screen in Google Cloud Console with proper domain verification

### 7. Production Deployment

When deploying to production with a proper domain:

1. The app will automatically use `/auth/callback` route for proper domains
2. For IP addresses, it will redirect to home page
3. No changes needed in Supabase or Google Cloud Console

## Security Notes

- Never commit your OAuth credentials to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console
