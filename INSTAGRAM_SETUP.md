# Instagram Basic Display API Setup Guide

This guide will help you configure Instagram authentication for your GreenPath application.

## Prerequisites

1. A Facebook Developer account (Instagram uses Facebook Developer Platform)
2. An Instagram account
3. Your application must be served over HTTPS in production

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" and select "Consumer" as the app type
3. Fill in your app details:
   - App Name: "GreenPath" or your preferred name
   - App Contact Email: Your email address
4. Once created, navigate to your app dashboard

## Step 2: Add Instagram Basic Display Product

1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. This will add Instagram Basic Display to your app

## Step 3: Configure Instagram Basic Display

1. In the Instagram Basic Display settings:
   - Go to "Instagram Basic Display" → "Basic Display"
   - Click "Create New App"
   - Fill in the required information:
     - Valid OAuth Redirect URIs: `http://localhost:5174/auth/instagram/callback`
     - Deauthorize Callback URL: `http://localhost:5174/auth/instagram/deauthorize`
     - Data Deletion Requests URL: `http://localhost:5174/auth/instagram/deauthorize`

**IMPORTANT**: Make sure the redirect URI exactly matches `http://localhost:5174/auth/instagram/callback` (note the port 5174).

## Step 4: Add Instagram Test Users

1. In Instagram Basic Display settings, go to "Roles" → "Roles"
2. Add Instagram Testers:
   - Click "Add Instagram Testers"
   - Enter Instagram usernames who will test the app
   - They need to accept the invitation in their Instagram app

## Step 5: Get Your Instagram Credentials

**IMPORTANT**: Instagram Basic Display has separate credentials from Facebook Login!

1. In **Instagram Basic Display** → **Basic Display**, note down:
   - **Instagram App ID** (NOT the Facebook App ID)
   - **Instagram App Secret** (NOT the Facebook App Secret)

2. These credentials are found in the **Instagram Basic Display** section, not in Settings → Basic!

## Step 6: Configure Environment Variables

Your `.env.local` file should contain the **Instagram-specific** credentials:
```env
VITE_INSTAGRAM_CLIENT_ID=your_instagram_app_id_from_basic_display_section
VITE_INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret_from_basic_display_section
VITE_INSTAGRAM_REDIRECT_URI=http://localhost:5174/auth/instagram/callback
```

**⚠️ Common Mistake**: Don't use Facebook Login credentials for Instagram Basic Display!

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login` in your browser
3. Click "Login with Instagram"
4. You should be redirected to Instagram for authorization
5. After authorization, you'll be redirected back to your app

## Important Notes

1. **Test Users Only**: Instagram Basic Display only works with test users until app review
2. **Limited Permissions**: Only provides basic profile info and media access
3. **App Review Required**: For public use, you need to submit for app review
4. **HTTPS Required**: Production apps must use HTTPS

## Available Data

Instagram Basic Display provides:
- User ID
- Username
- Account type (PERSONAL, BUSINESS)
- Media count (optional)

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error:**
   - Ensure the redirect URI matches exactly what's configured in your Instagram app
   - Check for trailing slashes and protocol (http vs https)

2. **"invalid_client" error:**
   - Verify your App ID and App Secret are correct
   - Ensure there are no extra spaces or characters

3. **"User not authorized" error:**
   - The user needs to be added as an Instagram Tester
   - Check if the user accepted the tester invitation

4. **"App not live" error:**
   - Your app is in development mode
   - Only Instagram Testers can use the app

## Next Steps for Production

1. **Submit for App Review**: Required for public access
2. **Implement Data Deletion**: Handle user data deletion requests
3. **Add Privacy Policy**: Required for Instagram apps
4. **Use HTTPS**: Required for production
5. **Handle Rate Limits**: Instagram has API rate limits

## Rate Limits

- Basic Display API: 200 requests per hour per user
- App-level rate limits also apply

## Support

For issues with Instagram API configuration, refer to:
- [Instagram Basic Display Documentation](https://developers.facebook.com/docs/instagram-basic-display-api/)
- [Facebook Developer Community](https://developers.facebook.com/community/)