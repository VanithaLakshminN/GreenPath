interface FacebookAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookUserProfile {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface FacebookUserData {
  id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  accessToken: string;
  facebookId: string;
  email?: string;
}

class FacebookAuthService {
  private config: FacebookAuthConfig;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_FACEBOOK_CLIENT_ID || '',
      redirectUri: import.meta.env.VITE_FACEBOOK_REDIRECT_URI || `${window.location.origin}/auth/facebook/callback`,
      scope: 'public_profile,email'
    };
  }

  /**
   * Generate Facebook OAuth URL for user authorization
   */
  getAuthUrl(forceAccountSelection = true): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      response_type: 'code',
      state: this.generateState() // CSRF protection
    });

    // Always force account selection to allow switching by default
    if (forceAccountSelection) {
      // Strategy 1: Force re-authentication
      params.append('auth_type', 'reauthenticate');
      // Strategy 2: Add display parameter for better UX
      params.append('display', 'page');
      // Strategy 3: Add a random parameter to bypass cache
      params.append('fbclid', Date.now().toString());
    }

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
    console.log('Facebook Auth URL:', authUrl);
    console.log('Client ID:', this.config.clientId);
    console.log('Redirect URI:', this.config.redirectUri);
    
    // Store state for verification
    sessionStorage.setItem('facebook_oauth_state', params.get('state')!);
    
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
  async exchangeCodeForToken(code: string): Promise<FacebookTokenResponse> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: import.meta.env.VITE_FACEBOOK_CLIENT_SECRET || '',
      redirect_uri: this.config.redirectUri,
      code: code
    });

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Facebook token exchange failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to get access token from Facebook');
    }
  }

  /**
   * Get user profile from Facebook Graph API
   */
  async getUserProfile(accessToken: string): Promise<FacebookUserProfile> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Facebook API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile from Facebook');
    }
  }

  /**
   * Complete Facebook authentication flow
   */
  async authenticateUser(code: string, state: string): Promise<FacebookUserData> {
    try {
      // Verify state parameter
      const storedState = sessionStorage.getItem('facebook_oauth_state');
      if (storedState !== state) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      // Clean up stored state
      sessionStorage.removeItem('facebook_oauth_state');

      // Step 1: Exchange code for access token
      const tokenResponse = await this.exchangeCodeForToken(code);
      
      // Step 2: Get user profile
      const userProfile = await this.getUserProfile(tokenResponse.access_token);
      
      // Step 3: Format user data
      const userData: FacebookUserData = {
        id: userProfile.id,
        username: userProfile.name.toLowerCase().replace(/\s+/g, '_'), // Create username from name
        fullName: userProfile.name,
        profilePicture: userProfile.picture?.data?.url || '',
        accessToken: tokenResponse.access_token,
        facebookId: userProfile.id,
        email: userProfile.email
      };

      return userData;
    } catch (error) {
      console.error('Facebook authentication error:', error);
      throw error;
    }
  }

  /**
   * Initiate Facebook OAuth flow
   */
  login(forceAccountSelection = true): void {
    const authUrl = this.getAuthUrl(forceAccountSelection);
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
      console.error('Facebook OAuth error:', error, errorDescription);
      throw new Error(`Facebook authentication failed: ${errorDescription || error}`);
    }

    return { code, state, error };
  }

  /**
   * Check if current page is Facebook callback
   */
  isCallbackPage(): boolean {
    return window.location.pathname === '/auth/facebook/callback';
  }

  /**
   * Validate Facebook configuration
   */
  isConfigured(): boolean {
    const clientId = this.config.clientId;
    const clientSecret = import.meta.env.VITE_FACEBOOK_CLIENT_SECRET || '';
    
    // Check if credentials exist and are not placeholder values
    return !!(clientId && 
             clientSecret && 
             clientId !== 'your_real_facebook_client_id_here' &&
             clientId !== 'your_facebook_client_id_here' &&
             clientId !== '123456789' &&
             clientSecret !== 'your_real_facebook_client_secret_here' &&
             clientSecret !== 'your_facebook_client_secret_here' &&
             clientSecret !== 'test_secret_key');
  }

  /**
   * Logout and revoke Facebook permissions
   */
  async logout(accessToken?: string): Promise<void> {
    if (accessToken) {
      try {
        // Revoke the access token
        await fetch(`https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.warn('Failed to revoke Facebook token:', error);
      }
    }
  }

  /**
   * Open Facebook logout page to help user switch accounts
   */
  openFacebookLogout(): void {
    // Open Facebook logout in a new tab
    const logoutUrl = 'https://www.facebook.com/logout.php';
    window.open(logoutUrl, '_blank', 'width=600,height=400');
  }
}

export default new FacebookAuthService();
export type { FacebookUserData };