# Microsoft Outlook API Integration for SlideIn

This document details how to set up and use the Microsoft Graph API integration for Outlook email sending in the SlideIn application.

## Overview

The Microsoft Graph API integration allows users to:
- Authenticate with their Microsoft/Outlook account via OAuth 2.0
- Send emails directly from their Outlook using the Microsoft Graph API
- Have those emails appear in their "Sent" folder
- Support for both personal and business Microsoft accounts

## Prerequisites

1. Create a Microsoft Azure Application
2. Configure OAuth consent and permissions
3. Get Application (client) ID and client secret
4. Set up redirect URIs

## Azure Application Setup

Follow these steps to set up your Microsoft Azure application:

### 1. Create an Azure Application

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Fill in the application details:
   - **Name**: Your app name (e.g., "SlideIn Email Tool")
   - **Supported account types**: Select "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: Select "Web" and add your callback URL (e.g., `http://localhost:3000/api/microsoft-auth/callback`)
5. Click "Register"

### 2. Configure API Permissions

1. In your registered app, go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Choose "Delegated permissions"
5. Add these permissions:
   - `User.Read` (to read user profile)
   - `Mail.Send` (to send emails)
   - `Mail.ReadWrite` (to read and write emails)
   - `offline_access` (to get refresh tokens)
6. Click "Add permissions"
7. Click "Grant admin consent" if you're an admin (recommended)

### 3. Create Client Secret

1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Add a description and set expiration
4. Click "Add"
5. **Important**: Copy the secret value immediately (you won't be able to see it again)

### 4. Configure Authentication

1. Go to "Authentication"
2. Under "Redirect URIs", ensure your callback URL is listed
3. Under "Implicit grant and hybrid flows", you can leave both unchecked for security
4. Save the configuration

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Microsoft Azure OAuth credentials
MICROSOFT_CLIENT_ID=your-application-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret

# Supabase (if not already configured)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Implementation Details

The Microsoft Graph integration consists of several components:

### 1. **Authentication Flow**
- `components/auth/MicrosoftSignIn.tsx`: React component for Microsoft sign-in
- `app/api/microsoft-auth/callback/route.ts`: Handles OAuth callback and stores tokens
- Uses Supabase Auth with Azure provider

### 2. **Email Sending**
- `lib/outlook.ts`: Contains Microsoft Graph API email sending functions
- `app/api/send-email/route.ts`: Unified API route supporting both Gmail and Outlook
- Automatic token refresh handling

### 3. **Database Schema**
The `email_accounts` table stores both Gmail and Outlook account credentials:
- `provider`: 'gmail' or 'outlook'
- `access_token`: OAuth access token
- `refresh_token`: OAuth refresh token for token renewal
- `expiry_date`: Token expiration timestamp

## Usage

### 1. Connect Outlook Account

Users can connect their Outlook account in several ways:
- Through the settings page
- Via the email generator interface
- Using the email connect component

### 2. Send Emails

Once connected, the application will:
- Automatically detect available email accounts (Gmail and Outlook)
- Allow users to select which account to send from
- Handle token refresh automatically
- Send emails through the appropriate API (Gmail or Microsoft Graph)

## Testing

1. Navigate to the email generator or settings page
2. Click "Connect Outlook" or the Microsoft sign-in button
3. Complete the OAuth flow
4. Select your Outlook account as the sender
5. Compose and send a test email
6. Check your Outlook "Sent" folder to verify the email was sent correctly

## API Scopes Explained

- **`User.Read`**: Allows reading basic user profile information (email, name)
- **`Mail.Send`**: Allows sending emails on behalf of the user
- **`Mail.ReadWrite`**: Allows reading and writing emails (for future features)
- **`offline_access`**: Allows getting refresh tokens for long-term access

## Security Considerations

- Client secrets should never be exposed to the frontend
- Tokens are stored securely in Supabase with Row Level Security (RLS)
- Refresh tokens are used to automatically renew expired access tokens
- All API calls are made server-side to protect credentials

## Troubleshooting

### Common Issues

1. **"Invalid client" error**
   - Check that `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` are correct
   - Verify the redirect URI matches your callback URL

2. **"Insufficient privileges" error**
   - Ensure all required API permissions are granted
   - Try granting admin consent for the permissions

3. **Token expired errors**
   - The application should automatically refresh tokens
   - If issues persist, users may need to reconnect their account

4. **"AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application"**
   - Check that your redirect URI in Azure matches your callback route exactly
   - Ensure you're using the correct protocol (http vs https)

### Debug Steps

1. Check browser developer tools for console errors
2. Verify environment variables are loaded correctly
3. Check Supabase logs for authentication errors
4. Review Azure AD logs for OAuth flow issues

## Migration from Gmail-only

If you're upgrading from a Gmail-only setup:

1. The existing Gmail integration will continue to work
2. Users can connect both Gmail and Outlook accounts
3. The application will automatically detect and support both providers
4. No data migration is required - both providers use the same `email_accounts` table

## Rate Limits

Microsoft Graph API has rate limits:
- **Mail.Send**: 10,000 requests per 10 minutes per user
- For high-volume applications, consider implementing request queuing

For more information, see the [Microsoft Graph throttling guidance](https://docs.microsoft.com/en-us/graph/throttling). 