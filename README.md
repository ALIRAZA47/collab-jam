# Collaborative Whiteboard

A real-time collaborative whiteboard application built with React, Node.js, Socket.io, and Firebase.

## Features

- ✨ Real-time collaboration with multiple users
- 🎨 Drawing tools: Pencil, Eraser, Shapes (Rectangle, Circle, Triangle, Diamond, Star, Hexagon)
- ✏️ Text annotations
- 🖼️ Image uploads
- 💾 Auto-save to Firebase Firestore
- 🌙 Dark/Light theme toggle
- 📱 Responsive design
- 🔗 Share room links

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Fabric.js (Canvas)
- Socket.io Client
- Firebase (Firestore)

**Backend:**
- Node.js + Express
- Socket.io
- TypeScript

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Firebase project (see `FIREBASE_SETUP.md`)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd collab-jam
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Configure environment variables**
   
   **Client** (`client/.env`):
   ```bash
   cp .env.sample .env
   # Edit .env and add your Firebase credentials
   ```
   
   **Server** (`server/.env`):
   ```bash
   cp .env.sample .env
   # Edit if needed (default PORT=3002)
   ```

4. **Run the application**
   
   In two separate terminals:
   
   **Terminal 1 - Server:**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Client:**
   ```bash
   cd client
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:5173`

## Deployment to Vercel

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/collab-jam)

## Firebase Setup

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase configuration instructions.

## Project Structure

```
collab-jam/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Firebase config
│   │   └── types.ts        # TypeScript types
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── index.ts        # Express + Socket.io server
│   │   └── socket.ts       # Socket.io handlers
│   └── package.json
└── vercel.json            # Vercel configuration
```

## Environment Variables

### Client (Frontend)

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |

### Server (Backend)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3002 |
| `NODE_ENV` | Environment | development |

## Available Scripts

### Client

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions:
- Open an issue on GitHub
- Check `VERCEL_DEPLOYMENT.md` for deployment help
- Check `FIREBASE_SETUP.md` for Firebase configuration help
