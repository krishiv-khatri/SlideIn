# SlideIn

A modern email generator and sender application built with Next.js, powered by Gmail API.

## Features

- **Email Generation**: AI-powered email content generation from URLs
- **Gmail Integration**: Send emails directly from your Gmail account
- **Email Tracking**: Track email opens and engagement
- **File Attachments**: Support for uploading and sending file attachments
- **Multiple Account Support**: Connect and manage multiple Gmail accounts
- **Responsive Design**: Works on desktop and mobile devices

## File Attachment Support

The email generator now supports file attachments with the following features:

### Supported File Types
- Documents: PDF, DOC, DOCX, TXT
- Images: PNG, JPG, JPEG, GIF
- Archives: ZIP, RAR
- And more common file types

### Attachment Limits
- Maximum file size: 25MB per file
- Maximum total attachment size: 25MB
- Multiple files can be attached to a single email

### How to Use Attachments
1. Generate your email content as usual
2. In the email composition area, click "Choose Files" in the "Attach Files" section
3. Select one or more files from your computer
4. Files will be displayed with their names and sizes
5. Remove individual files by clicking the X button next to them
6. Send the email - attachments will be included automatically

### Technical Implementation
The attachment feature uses:
- Gmail API's multipart MIME message format
- Base64 encoding for file data transmission
- Proper MIME type detection for different file formats
- Frontend file validation and size checking

## Getting Started

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/krishivkhatri2409-gmailcoms-projects/v0-slide-in-web-app-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/3mtiUiP32OL)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/krishivkhatri2409-gmailcoms-projects/v0-slide-in-web-app-design](https://vercel.com/krishivkhatri2409-gmailcoms-projects/v0-slide-in-web-app-design)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/3mtiUiP32OL](https://v0.dev/chat/projects/3mtiUiP32OL)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository