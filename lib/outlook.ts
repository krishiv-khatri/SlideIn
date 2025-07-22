import { Client } from '@microsoft/microsoft-graph-client';

// Interface for email attachments
interface EmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  data: string; // base64 encoded file data
}

// Interface for refresh token result
interface RefreshTokenResult {
  success: boolean;
  tokens?: {
    access_token?: string;
    refresh_token?: string;
    expiry_date?: number;
  };
  error?: string;
}

// Create Microsoft Graph client with access token
const createGraphClient = (accessToken: string) => {
  return Client.init({
    authProvider: (done: (error: any, token: string | null) => void) => {
      done(null, accessToken);
    }
  });
};

// Refresh Microsoft token if needed
export const refreshMicrosoftTokenIfNeeded = async (refreshToken: string): Promise<RefreshTokenResult> => {
  try {
    // Microsoft token refresh endpoint
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/User.Read'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', errorText);
      return {
        success: false,
        error: 'Failed to refresh Microsoft token'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      tokens: {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        expiry_date: Date.now() + (data.expires_in || 3600) * 1000
      }
    };
  } catch (error) {
    console.error('Error refreshing Microsoft token:', error);
    return {
      success: false,
      error: 'Failed to refresh Microsoft token'
    };
  }
};

// Send email using Microsoft Graph API
export const sendOutlookEmail = async ({
  accessToken,
  refreshToken,
  to,
  subject,
  htmlContent,
  attachments = []
}: {
  accessToken: string;
  refreshToken: string;
  to: string;
  subject: string;
  htmlContent: string;
  attachments?: EmailAttachment[];
}) => {
  try {
    const graphClient = createGraphClient(accessToken);

    // Prepare email message
    const message: any = {
      subject: subject,
      body: {
        contentType: 'HTML',
        content: htmlContent
      },
      toRecipients: [
        {
          emailAddress: {
            address: to
          }
        }
      ]
    };

    // Add attachments if any
    if (attachments.length > 0) {
      message.attachments = attachments.map(attachment => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: attachment.filename,
        contentType: attachment.mimeType,
        contentBytes: attachment.data
      }));
    }

    // Send the email
    const result = await graphClient.api('/me/sendMail').post({
      message: message
    });

    return {
      success: true,
      messageId: result?.id || 'sent',
      attachmentsCount: attachments.length
    };
  } catch (error: any) {
    console.error('Error sending email with Microsoft Graph API:', error);
    
    // Check if token needs refresh and retry
    if (error.code === 'InvalidAuthenticationToken' || 
        error.code === 'TokenExpired' || 
        error.statusCode === 401) {
      try {
        // Force token refresh
        const refreshResult = await refreshMicrosoftTokenIfNeeded(refreshToken);
        
        if (refreshResult.success && refreshResult.tokens?.access_token) {
          return {
            success: false,
            needsTokenRefresh: true,
            refreshedTokens: {
              access_token: refreshResult.tokens.access_token,
              refresh_token: refreshResult.tokens.refresh_token || refreshToken,
              expiry_date: refreshResult.tokens.expiry_date || Date.now() + 3600 * 1000
            },
            error: 'Token refresh required. Please try again.'
          };
        } else {
          throw new Error('Failed to refresh token');
        }
      } catch (refreshError) {
        console.error('Error refreshing Microsoft token:', refreshError);
        return {
          success: false,
          error: 'Authentication expired. Please reconnect your Outlook account.'
        };
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to send email via Outlook'
    };
  }
}; 