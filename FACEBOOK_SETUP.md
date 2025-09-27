# Facebook Authentication Setup Guide

This guide will help you configure Facebook authentication for your GreenPath application.

## Prerequisites

1. A Facebook Developer account
2. A Facebook account (Personal or Business)
3. Your application must be served over HTTPS in production

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" and select "Consumer" or "Business" as the app type
3. Fill in your app details:
   - App Name: "GreenPath" or your preferred name
   - App Contact Email: Your email address
4. Once created, navigate to your app dashboard

## Step 2: Add Facebook Login Product

1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. This will add Facebook Login to your app

## Step 3: Configure Facebook Login

1. In the Facebook Login settings:
   - Go to "Facebook Login" → "Settings"
   - Configure Valid OAuth Redirect URIs:
     - For development: `http://localhost:5173/auth/facebook/callback`
     - For production: `https://yourdomain.com/auth/facebook/callback`

2. Configure permissions:
   - Go to "App Review" → "Permissions and Features"
   - Request `public_profile` and `email` permissions

## Step 4: Set Up Data Deletion (Required)

1. In your app settings, go to "Settings" → "Basic"
2. Add Data Deletion Callback URL:
   - For development: `http://localhost:5173/auth/facebook/deauthorize`
   - For production: `https://yourdomain.com/auth/facebook/deauthorize`

## Step 5: Get Your Credentials

1. In "Settings" → "Basic", note down:
   - **App ID** (Client ID)
   - **App Secret** (Client Secret)

## Step 6: Configure Environment Variables

1. Update your `.env.local` file with your credentials:
   ```env
   VITE_FACEBOOK_CLIENT_ID=your_facebook_app_id_here
   VITE_FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
   VITE_FACEBOOK_REDIRECT_URI=http://localhost:5173/auth/facebook/callback
   ```

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login` in your browser
3. Click "Login with Facebook"
4. You should be redirected to Facebook for authorization
5. After authorization, you'll be redirected back to your app

## Important Security Notes

1. **Never commit `.env.local` to version control**
2. **App Secret should be kept secure** - in production, consider using a backend service
3. **Validate redirect URIs** - ensure they match exactly what's configured in your Facebook app
4. **Use HTTPS in production** - Facebook requires HTTPS for OAuth redirects

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error:**
   - Ensure the redirect URI in your `.env.local` exactly matches the one configured in your Facebook app
   - Check for trailing slashes and protocol (http vs https)

2. **"invalid_client" error:**
   - Verify your App ID and App Secret are correct
   - Ensure there are no extra spaces or characters

3. **"access_denied" error:**
   - The user denied permission
   - Ensure your app has the correct permissions configured

4. **CORS errors:**
   - Facebook API calls must be made from your backend in production
   - For development, the current setup should work

### Development vs Production:

- **Development**: Can use `http://localhost:5173`
- **Production**: Must use HTTPS (`https://yourdomain.com`)

## API Limitations

Facebook Login API has the following limitations:
- Rate limiting applies based on your app's usage tier
- Some permissions require app review for public use
- Basic profile information is available by default

## Privacy and Compliance

1. **Data Use Policy**: Ensure your app complies with Facebook's Data Use Policy
2. **Privacy Policy**: Required for apps using Facebook Login
3. **User Data**: Only request data you actually need
4. **Data Deletion**: Implement proper data deletion when users deauthorize your app

## Next Steps

After successful setup:
1. Test the authentication flow thoroughly
2. Implement proper error handling
3. Add logout functionality that properly clears Facebook sessions
4. Test with multiple users
5. Prepare for app review if needed
6. Implement data deletion compliance

## Support

For issues with Facebook API configuration, refer to:
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Facebook Developer Community](https://developers.facebook.com/community/)
- [Facebook Platform Policy](https://developers.facebook.com/policy/)