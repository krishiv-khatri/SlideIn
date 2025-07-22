import { NextResponse } from 'next/server';
import { sendEmail, refreshTokenIfNeeded } from '@/lib/gmail';
import { sendOutlookEmail, refreshMicrosoftTokenIfNeeded } from '@/lib/outlook';
import { createEmailTrackingEvent, addTrackingPixelToEmail } from '@/utils/email-tracking';

// Interface for file attachments
interface EmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  data: string; // base64 encoded file data
}

// Interface for email tokens
interface EmailTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

// Interface for the request body
interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  gmailTokens?: EmailTokens;
  outlookTokens?: EmailTokens;
  provider: 'gmail' | 'outlook';
  trackingEnabled?: boolean;
  userId?: string;
  attachments?: EmailAttachment[];
}

export async function POST(request: Request) {
  console.log('Send Email API route called');
  
  try {
    const body = await request.json();
    const { to, subject, html, gmailTokens, outlookTokens, provider = 'gmail', trackingEnabled = false, userId, attachments = [] } = body as SendEmailRequest;
    
    console.log('Request body received:', { 
      to, 
      subject, 
      htmlLength: html?.length, 
      provider,
      gmailTokensPresent: !!gmailTokens,
      outlookTokensPresent: !!outlookTokens,
      trackingEnabled,
      hasUserId: !!userId,
      attachmentsCount: attachments.length
    });

    if (!to || !subject || !html) {
      console.error('Missing required fields in request');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate tokens based on provider
    const tokens = provider === 'gmail' ? gmailTokens : outlookTokens;
    if (!tokens) {
      console.error(`Missing ${provider} tokens`);
      return NextResponse.json(
        { success: false, error: `Missing ${provider} authentication tokens` },
        { status: 400 }
      );
    }

    // Check if token is about to expire and refresh if needed
    const currentTime = Date.now();
    let accessToken = tokens.access_token;
    let refreshToken = tokens.refresh_token;
    
    // If the token will expire in less than 5 minutes, refresh it
    if (tokens.expiry_date && tokens.expiry_date < currentTime + 5 * 60 * 1000) {
      console.log(`${provider} token is about to expire, refreshing`);
      
      const refreshResult = provider === 'gmail' 
        ? await refreshTokenIfNeeded(refreshToken)
        : await refreshMicrosoftTokenIfNeeded(refreshToken);
      
      if (refreshResult.success && refreshResult.tokens) {
        accessToken = refreshResult.tokens.access_token || accessToken;
        refreshToken = refreshResult.tokens.refresh_token || refreshToken;
        console.log(`${provider} token refreshed successfully`);
      } else {
        console.error(`Failed to refresh ${provider} token:`, refreshResult);
        return NextResponse.json(
          { success: false, error: `Failed to refresh ${provider} authentication token` },
          { status: 401 }
        );
      }
    }

    // Add tracking pixel if enabled
    let finalHtml = html;
    let emailId = null;
    
    if (trackingEnabled) {
      console.log('Tracking is enabled, adding tracking pixel');
      try {
        // Create a tracking event and get tracking pixel, passing userId
        const trackingResult = await createEmailTrackingEvent(to, subject, userId);
        emailId = trackingResult.emailId;
        
        console.log('Tracking event created with ID:', emailId);
        
        // Add tracking pixel to email HTML
        finalHtml = addTrackingPixelToEmail(html, trackingResult.trackingPixelHtml);
        console.log('Tracking pixel added to HTML');
      } catch (trackingError) {
        console.error('Failed to add email tracking:', trackingError);
        // Instead of silently continuing, let's include this error in the response
        emailId = null;
        finalHtml = html;
      }
    } else {
      console.log('Tracking is disabled, skipping tracking pixel');
    }

    // Send the email via the appropriate provider API
    console.log(`Sending email via ${provider} API`);
    const result = provider === 'gmail' 
      ? await sendEmail({
          accessToken,
          refreshToken,
          to,
          subject,
          htmlContent: finalHtml,
          attachments
        })
      : await sendOutlookEmail({
          accessToken,
          refreshToken,
          to,
          subject,
          htmlContent: finalHtml,
          attachments
        });

    if (!result.success) {
      console.error('Failed to send email:', result);
      // If token needs refresh, return the refreshed tokens with the error
      if (result.needsTokenRefresh && result.refreshedTokens) {
        return NextResponse.json({
          success: false,
          error: result.error,
          refreshedTokens: result.refreshedTokens
        });
      }
      
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    console.log('Email sent successfully', { messageId: result.messageId, emailId });
    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      emailId: emailId // Include the email ID if tracking was enabled
    });
  } catch (error) {
    console.error('Request processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}