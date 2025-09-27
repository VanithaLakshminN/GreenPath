# Instagram Authentication Setup Guide (DEPRECATED)

**⚠️ This project now uses Facebook Login only. Instagram authentication has been removed.**
**Please refer to FACEBOOK_SETUP.md for current setup instructions.**

---

*This file is kept for reference only. The Instagram authentication feature has been permanently removed from the application.*

## Removal Notice

Instagram login functionality has been completely removed from GreenPath application as of the latest update. The application now exclusively uses Facebook authentication for the following reasons:

1. **Simplified User Experience**: Single authentication method reduces confusion
2. **Maintenance Efficiency**: Easier to maintain one OAuth provider
3. **Feature Consistency**: Facebook provides more comprehensive user data
4. **Development Focus**: Concentrate on core green travel features

## Migration to Facebook Login

If you were using Instagram authentication, please:
1. Use Facebook login instead
2. Refer to FACEBOOK_SETUP.md for configuration
3. Update any bookmarks to use Facebook authentication

---

*For current authentication setup, see: FACEBOOK_SETUP.md*

## Prerequisites

1. A Facebook Developer account (Instagram uses Facebook's developer platform)
2. An Instagram account (Personal or Business)
3. Your application must be served over HTTPS in production

## Step 1: Create an Instagram App in Facebook Developer Console

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Use your existing app or create a new one for Instagram
3. Navigate to your app dashboard

## Step 2: Add Instagram Basic Display Product

1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. This will add Instagram Basic Display to your app

## Step 3: Configure Instagram Basic Display

1. In the Instagram Basic Display settings:
   - Click "Create New App" under "Instagram App ID"
   - Fill in the required information
   - Save your changes

2. Configure OAuth Redirect URIs:
   - For development: `http://localhost:5173/auth/instagram/callback`
   - For production: `https://yourdomain.com/auth/instagram/callback`

3. Add test users (for development):
   - Go to "Roles" → "Roles" in your app dashboard
   - Add Instagram accounts that can test your app

## Step 4: Get Your Instagram Credentials

1. In Instagram Basic Display settings, note down:
   - **Instagram App ID** (Client ID)
   - **Instagram App Secret** (Client Secret)

## Step 5: Configure Environment Variables

Update your `.env.local` file with Instagram credentials:

```env
# Instagram OAuth Configuration
VITE_INSTAGRAM_CLIENT_ID=your_instagram_app_id_here
VITE_INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret_here
VITE_INSTAGRAM_REDIRECT_URI=http://localhost:5173/auth/instagram/callback
```

## Step 6: Test Instagram Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login` in your browser
3. Click "Login with Instagram"
4. You should be redirected to Instagram for authorization
5. After authorization, you'll be redirected back to your app

## Important Security Notes

1. **Never commit `.env.local` to version control**
2. **App Secret should be kept secure** - in production, consider using a backend service
3. **Validate redirect URIs** - ensure they match exactly what's configured in your Instagram app
4. **Use HTTPS in production** - Instagram requires HTTPS for OAuth redirects

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error:**
   - Ensure the redirect URI in your `.env.local` exactly matches the one configured in your Instagram app
   - Check for trailing slashes and protocol (http vs https)

2. **"invalid_client" error:**
   - Verify your App ID and App Secret are correct
   - Ensure there are no extra spaces or characters

3. **"access_denied" error:**
   - The user denied permission
   - Ensure your app has the correct permissions configured

4. **CORS errors:**
   - Instagram API calls must be made from your backend in production
   - For development, the current setup should work

### Development vs Production:

- **Development**: Can use `http://localhost:5173`
- **Production**: Must use HTTPS (`https://yourdomain.com`)

## API Limitations

Instagram Basic Display API has the following limitations:
- Limited to 200 requests per hour per user
- Only provides basic profile information (username, account type, media count)
- Requires app review for public use
- No access to full name or email (unlike Facebook)

## Comparison with Facebook Login

| Feature | Facebook | Instagram |
|---------|----------|-----------|
| Full Name | ✅ Yes | ❌ No |
| Email | ✅ Yes | ❌ No |
| Username | ✅ Generated | ✅ Native |
| Profile Picture | ✅ Yes | ❌ Limited |
| Account Switching | ✅ Yes | ✅ Yes |

## Next Steps

After successful setup:
1. Test the authentication flow thoroughly
2. Implement proper error handling
3. Test with multiple users
4. Consider implementing refresh token logic for long-term sessions
5. Add logout functionality
6. Test both Facebook and Instagram login options

## Support

For issues with Instagram API configuration, refer to:
- [Instagram Basic Display API Documentation](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Facebook Developer Community](https://developers.facebook.com/community/)

## Multi-Platform Authentication

Your app now supports both Facebook and Instagram authentication:
- Users can choose their preferred platform
- Username setup works for both platforms
- Account switching is available for both
- Unified user experience across platforms