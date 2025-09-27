# Quick Setup Instructions for Instagram Authentication

## Current Issue
You're seeing "Invalid platform app" because the app is using placeholder Instagram credentials. You need real Instagram app credentials from Facebook Developer Console.

## Quick Fix Options

### Option 1: Disable Instagram Authentication (Quick Test)
If you want to test the app without Instagram login:

1. Comment out Instagram login button in the UI
2. Use local storage user simulation instead

### Option 2: Set Up Real Instagram Authentication (Recommended)

Follow these steps to get real Instagram credentials:

#### Step 1: Create Facebook Developer Account
1. Go to https://developers.facebook.com/
2. Create a developer account or log in
3. Click "Create App" → Select "Consumer"

#### Step 2: Add Instagram Basic Display
1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. Click "Create New App" under Instagram App ID

#### Step 3: Configure OAuth Settings
1. In Instagram Basic Display settings
2. Add Valid OAuth Redirect URI: `http://localhost:5175/auth/instagram/callback`
3. For production: `https://yourdomain.com/auth/instagram/callback`

#### Step 4: Get Your Credentials
1. Copy your Instagram App ID (Client ID)
2. Copy your Instagram App Secret (Client Secret)

#### Step 5: Update Environment Variables
Replace in `.env.local`:
```
VITE_INSTAGRAM_CLIENT_ID=your_actual_instagram_app_id
VITE_INSTAGRAM_CLIENT_SECRET=your_actual_instagram_app_secret
```

#### Step 6: Test Users (Development)
1. Go to app dashboard → Roles → Roles
2. Add Instagram test users who can test your app

## Alternative: Demo Mode
If you want to demo the app without real Instagram auth, I can create a demo login flow that simulates the user experience.

Choose which option you'd like to proceed with!