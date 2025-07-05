import { google } from 'googleapis';

// Set up OAuth2 client with credentials from environment variables
export const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// Exchange authorization code for tokens
export const getTokensFromCode = async (code: string) => {
  const oauth2Client = createOAuth2Client();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return { 
      success: true, 
      tokens 
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to exchange code for tokens' 
    };
  }
};

// Generate authentication URL
export const getAuthUrl = () => {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required for refresh token
    scope: [
      'https://www.googleapis.com/auth/gmail.send'
    ],
    prompt: 'consent' // Force consent screen to ensure we get refresh token
  });
};

// Interface for file attachments
interface EmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  data: string; // base64 encoded file data
}

// Send email using Gmail API
export const sendEmail = async ({
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
  const oauth2Client = createOAuth2Client();
  
  // Set credentials for the OAuth2 client
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  
  // Create Gmail API client
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  let mimeMessage: string;
  
  if (attachments.length > 0) {
    // Create multipart MIME message with attachments
    const boundary = `__SlideIn_Boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}__`;
    
    const messageParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(htmlContent, 'utf8').toString('base64'),
      ''
    ];
    
    // Add each attachment
    attachments.forEach((attachment) => {
      messageParts.push(
        `--${boundary}`,
        `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`,
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        'Content-Transfer-Encoding: base64',
        '',
        attachment.data,
        ''
      );
    });
    
    // Close the multipart message
    messageParts.push(`--${boundary}--`);
    
    mimeMessage = messageParts.join('\r\n');
  } else {
    // Simple HTML message without attachments
    mimeMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlContent
    ].join('\r\n');
  }
  
  // Encode the email in base64 URL-safe format
  const encodedMessage = Buffer.from(mimeMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  try {
    // Send the message
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
    
    return {
      success: true,
      messageId: res.data.id,
      attachmentsCount: attachments.length
    };
  } catch (error) {
    console.error('Error sending email with Gmail API:', error);
    
    // Check if token needs refresh and retry
    if (error instanceof Error && 
        (error.message.includes('invalid_grant') || 
         error.message.includes('invalid_token') || 
         error.message.includes('expired_token'))) {
      try {
        // Force token refresh
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        if (!credentials.access_token || !credentials.expiry_date) {
          throw new Error('Failed to refresh token');
        }
        
        // Return refreshed tokens along with error for client to update storage
        return {
          success: false,
          needsTokenRefresh: true,
          refreshedTokens: {
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token || refreshToken,
            expiry_date: credentials.expiry_date
          },
          error: 'Token refresh required. Please try again.'
        };
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        return {
          success: false,
          error: 'Authentication expired. Please reconnect your Gmail account.'
        };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
};

// Refresh token if it's expired
export const refreshTokenIfNeeded = async (refreshToken: string) => {
  const oauth2Client = createOAuth2Client();
  
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });
  
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return {
      success: true,
      tokens: credentials
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh token'
    };
  }
}; 