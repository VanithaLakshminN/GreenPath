interface InstagramAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
}

interface InstagramUserProfile {
  id: string;
  username: string;
  account_type: string;
  media_count?: number;
}

interface InstagramUserData {
  id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  accessToken: string;
  instagramId: string;
  accountType: string;
}

class InstagramAuthService {
  private config: InstagramAuthConfig;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '',
      redirectUri: import.meta.env.VITE_INSTAGRAM_REDIRECT_URI || `${window.location.origin}/auth/instagram/callback`,
      scope: 'user_profile'
    };
  }

  /**
   * Generate Instagram OAuth URL for user authorization
   */
  getAuthUrl(forceAccountSelection = true): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      response_type: 'code',
      state: this.generateState() // CSRF protection
    });

    // For Instagram Basic Display, don't add extra parameters that might cause issues
    if (forceAccountSelection) {
      // Use standard auth_type for Instagram
      params.append('auth_type', 'rerequest');
    }

    // Instagram Basic Display uses Facebook's authorization endpoint
    // Try with standard Facebook OAuth first to test credentials
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
    console.log('Instagram Auth URL:', authUrl);
    console.log('Client ID:', this.config.clientId);
    console.log('Redirect URI:', this.config.redirectUri);
    console.log('Scope:', this.config.scope);
    console.log('Full URL for debugging:', authUrl);
    
    // Store state for verification
    sessionStorage.setItem('instagram_oauth_state', params.get('state')!);
    
    return authUrl;
  }

  /**
   * Generate a random state string for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<InstagramTokenResponse> {
    const formData = new FormData();
    formData.append('client_id', this.config.clientId);
    formData.append('client_secret', import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET || '');
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', this.config.redirectUri);
    formData.append('code', code);

    try {
      // Instagram Basic Display uses Facebook's token endpoint
      const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Instagram token exchange failed: ${errorData.error_message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to get access token from Instagram');
    }
  }

  /**
   * Get user profile from Instagram Graph API
   */
  async getUserProfile(accessToken: string): Promise<InstagramUserProfile> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Instagram API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile from Instagram');
    }
  }

  /**
   * Test function - for development only
   * Remove this in production
   */
  async testWithToken(accessToken: string): Promise<void> {
    try {
      console.log('Testing Instagram API with provided token...');
      const profile = await this.getUserProfile(accessToken);
      console.log('Instagram Profile:', profile);
    } catch (error) {
      console.error('Test failed:', error);
    }
  }

  /**
   * Diagnostic function to help debug configuration issues
   */
  diagnoseConfiguration(): void {
    console.log('=== Instagram Auth Configuration Diagnostic ===');
    console.log('Client ID:', this.config.clientId);
    console.log('Client ID Length:', this.config.clientId.length);
    console.log('Client ID Type:', typeof this.config.clientId);
    console.log('Client Secret Available:', !!import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET);
    console.log('Redirect URI:', this.config.redirectUri);
    console.log('Scope:', this.config.scope);
    console.log('Is Configured:', this.isConfigured());
    console.log('Environment Variables:');
    console.log('  VITE_INSTAGRAM_CLIENT_ID:', import.meta.env.VITE_INSTAGRAM_CLIENT_ID);
    console.log('  VITE_INSTAGRAM_CLIENT_SECRET:', import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET ? '[HIDDEN]' : 'NOT SET');
    console.log('  VITE_INSTAGRAM_REDIRECT_URI:', import.meta.env.VITE_INSTAGRAM_REDIRECT_URI);
    
    // Test URL generation
    const testUrl = this.getAuthUrl(false);
    console.log('Generated Auth URL:', testUrl);
    console.log('=== End Diagnostic ===');
  }

  /**
   * Complete Instagram authentication flow
   */
  async authenticateUser(code: string, state: string): Promise<InstagramUserData> {
    try {
      // Verify state parameter
      const storedState = sessionStorage.getItem('instagram_oauth_state');
      if (storedState !== state) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      // Clean up stored state
      sessionStorage.removeItem('instagram_oauth_state');

      // Step 1: Exchange code for access token
      const tokenResponse = await this.exchangeCodeForToken(code);
      
      // Step 2: Get user profile
      const userProfile = await this.getUserProfile(tokenResponse.access_token);
      
      // Step 3: Format user data
      const userData: InstagramUserData = {
        id: userProfile.id,
        username: userProfile.username,
        fullName: userProfile.username, // Instagram doesn't provide full name in basic scope
        profilePicture: '', // Would need additional API call with media permissions
        accessToken: tokenResponse.access_token,
        instagramId: userProfile.id,
        accountType: userProfile.account_type
      };

      return userData;
    } catch (error) {
      console.error('Instagram authentication error:', error);
      throw error;
    }
  }

  /**
   * Initiate Instagram OAuth flow
   */
  login(forceAccountSelection = true): void {
    // Run diagnostic first
    this.diagnoseConfiguration();
    
    const authUrl = this.getAuthUrl(forceAccountSelection);
    console.log('About to redirect to:', authUrl);
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback and extract authorization code
   */
  handleCallback(): { code: string | null; state: string | null; error: string | null } {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      console.error('Instagram OAuth error:', error, errorDescription);
      throw new Error(`Instagram authentication failed: ${errorDescription || error}`);
    }

    return { code, state, error };
  }

  /**
   * Check if current page is Instagram callback
   */
  isCallbackPage(): boolean {
    return window.location.pathname === '/auth/instagram/callback';
  }

  /**
   * Validate Instagram configuration
   */
  isConfigured(): boolean {
    const clientId = this.config.clientId;
    const clientSecret = import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET || '';
    
    // Check if credentials exist and are not placeholder values
    return !!(clientId && 
             clientSecret && 
             clientId !== 'your_real_instagram_client_id_here' &&
             clientId !== 'your_instagram_client_id_here' &&
             clientId !== '123456789' &&
             clientSecret !== 'your_real_instagram_client_secret_here' &&
             clientSecret !== 'your_instagram_client_secret_here' &&
             clientSecret !== 'test_secret_key');
  }

  /**
   * Logout and revoke Instagram permissions
   */
  async logout(accessToken?: string): Promise<void> {
    if (accessToken) {
      try {
        // Instagram doesn't have a simple revoke endpoint like Facebook
        // The access token will expire naturally
        console.log('Instagram access token will expire naturally');
      } catch (error) {
        console.warn('Failed to revoke Instagram token:', error);
      }
    }
  }

  /**
   * Open Instagram logout page to help user switch accounts
   */
  openInstagramLogout(): void {
    // Open Instagram logout in a new tab
    const logoutUrl = 'https://www.instagram.com/accounts/logout/';
    window.open(logoutUrl, '_blank', 'width=600,height=400');
  }
}

export default new InstagramAuthService();
export type { InstagramUserData };