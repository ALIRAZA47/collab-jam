# Deployment Guide for Vercel

This guide will help you deploy your collaborative whiteboard app to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Firebase project set up (see `FIREBASE_SETUP.md`)
- Git repository pushed to GitHub/GitLab/Bitbucket

## Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect the configuration from `vercel.json`
4. Configure environment variables (see below)
5. Click "Deploy"

### 3. Configure Environment Variables

In your Vercel project settings, add the following environment variables:

#### Frontend Environment Variables

Navigate to: **Project Settings → Environment Variables**

Add these variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note:** Get these values from your Firebase Console → Project Settings → General

#### Backend Environment Variables

```
NODE_ENV=production
PORT=3002
```

### 4. Deploy via CLI (Alternative)

If using the Vercel CLI:

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 5. Set up Custom Domain (Optional)

1. Go to **Project Settings → Domains**
2. Add your custom domain
3. Configure DNS settings as instructed by Vercel

## Important Notes

### WebSocket Support

Vercel supports WebSocket connections for real-time collaboration. The Socket.io connection will work correctly with the configuration provided in `vercel.json`.

### CORS Configuration

The backend is already configured to accept requests from any origin. In production, you may want to restrict this to your Vercel domain:

```typescript
// server/src/index.ts
const corsOptions = {
  origin: 'https://your-domain.vercel.app',
  credentials: true
};
```

### Firebase Firestore

Ensure your Firestore security rules are properly configured for production. See `FIREBASE_SETUP.md` for details.

## Troubleshooting

### Build Fails

- Check that all environment variables are set
- Verify TypeScript compilation succeeds locally: `npm run build`
- Check Vercel build logs for specific errors

### Socket.io Connection Issues

- Ensure WebSocket connections are enabled in Vercel
- Check browser console for connection errors
- Verify the backend URL is correctly configured

### Environment Variables Not Working

- Environment variables must start with `VITE_` for Vite to expose them to the client
- Redeploy after adding/changing environment variables
- Clear Vercel cache if needed: `vercel --prod --force`

## Architecture

```
┌─────────────────────┐
│   Vercel Platform   │
├─────────────────────┤
│                     │
│  Frontend (Vite)    │
│  /client/dist       │
│                     │
├─────────────────────┤
│                     │
│  Backend (Node.js)  │
│  /server/dist       │
│  Socket.io Server   │
│                     │
└─────────────────────┘
         ↓
┌─────────────────────┐
│  Firebase Firestore │
│  (Data Persistence) │
└─────────────────────┘
```

## Post-Deployment

1. Test the application at your Vercel URL
2. Create a new board and verify:
   - Real-time collaboration works
   - Canvas persists when refreshing
   - Firebase saves data correctly
3. Test with multiple users from different devices

## Monitoring

- View deployment logs in Vercel Dashboard
- Monitor function execution under **Analytics** tab
- Check error logs under **Logs** tab

## Support

For issues specific to:
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Firebase**: [firebase.google.com/support](https://firebase.google.com/support)
