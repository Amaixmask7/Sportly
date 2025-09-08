# OAuth Setup Guide

## Google OAuth Configuration

### 1. Supabase Dashboard Configuration

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** provider
4. Add the following redirect URLs:

**For Development:**
```
http://localhost:8080/auth/callback
http://localhost:3000/auth/callback
```

**For Production:**
```
http://10.236.187.240:8080/auth/callback
https://yourdomain.com/auth/callback
```

### 2. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set **Application type** to **Web application**
6. Add **Authorized redirect URIs**:

**For Development:**
```
https://your-supabase-project.supabase.co/auth/v1/callback
```

**For Production:**
```
https://your-supabase-project.supabase.co/auth/v1/callback
```

### 3. Environment Variables

Make sure your `.env` file contains:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Testing OAuth

1. Start your development server: `npm run dev`
2. Navigate to your app URL
3. Click "Masuk dengan Google"
4. Complete the OAuth flow
5. You should be redirected back to your app

### 5. Troubleshooting

**Issue: Redirect to localhost:3000 instead of your domain**
- Solution: Update redirect URLs in both Supabase and Google Cloud Console

**Issue: "This site can't be reached" error**
- Solution: Make sure the redirect URL in Supabase matches your actual domain

**Issue: OAuth consent screen issues**
- Solution: Configure OAuth consent screen in Google Cloud Console with proper domain verification

### 6. Production Deployment

When deploying to production:

1. Update redirect URLs in Supabase Dashboard
2. Update redirect URLs in Google Cloud Console
3. Make sure your domain is verified in Google Cloud Console
4. Test the OAuth flow on your production domain

## Security Notes

- Never commit your OAuth credentials to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console
