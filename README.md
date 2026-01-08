# DiaryBaby 🌸

A private, personal AI diary web app with a gentle, emotionally-safe interface.

## Features

- **Private Diary:** Write personal diary entries with complete privacy
- **AI Companion:** Receive gentle, supportive AI responses to each entry
- **Emotional Safety:** Calm design with soft pink Sakura theme
- **Privacy First:**
  - User data strictly isolated
  - OpenAI API key stored only in browser (never server-side)
  - JWT authentication with HTTP-only cookies (7-day expiry)
  - Passwords hashed with bcrypt (12 salt rounds)
- **Modern UX:**
  - Responsive design
  - Gentle animations
  - Accessible interface
  - No dark mode (calm, consistent experience)

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS v4 with custom Sakura Soft theme
- **Backend:** Next.js API routes
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens (HTTP-only cookies, 7-day expiry)
- **Password Hashing:** bcrypt (12 salt rounds)
- **AI:** OpenAI API (gpt-3.5-turbo, user-provided key)

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud - MongoDB Atlas recommended)
- OpenAI API key (obtainable from https://platform.openai.com/api-keys)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd diary-baby
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add:
- `MONGODB_URI`: Your MongoDB connection string
  - Local: `mongodb://localhost:27017/diarybaby`
  - MongoDB Atlas: Follow their connection string guide
- `JWT_SECRET`: Generate a strong random string (use `openssl rand -base64 32`)

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Set up your OpenAI API key

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API keys section
3. Create a new API key
4. In the app, go to Settings and enter your API key
5. Your key is stored only in your browser (localStorage, never sent to server)

## Usage Guide

- **Sign up:** Create account with email, name, and password
- **Login:** Enter credentials (session lasts 7 days)
- **Write diary:** Navigate to Diary page, write entry, submit
- **AI response:** Receive gentle, supportive reply (3-6 sentences)
- **View history:** All entries displayed in sidebar (newest first)
- **Settings:** Manage API key and view account info
- **Logout:** Clears session (returns to login)

## Project Structure

```
diary-baby/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts    # User registration
│   │   │   │   ├── login/route.ts       # User login + JWT
│   │   │   │   ├── logout/route.ts      # Clear auth cookie
│   │   │   │   └── me/route.ts          # Get current user
│   │   │   └── diary/
│   │   │       └── route.ts             # GET/POST diary entries
│   │   ├── diary/
│   │   │   └── page.tsx                 # Main diary interface
│   │   ├── settings/
│   │   │   └── page.tsx                 # Settings + API key management
│   │   ├── login/
│   │   │   └── page.tsx                 # Login form
│   │   ├── signup/
│   │   │   └── page.tsx                 # Registration form
│   │   ├── layout.tsx                   # Root layout + fonts
│   │   ├── page.tsx                     # Root redirect to /login
│   │   └── globals.css                  # Sakura Soft theme
│   ├── lib/
│   │   ├── models/
│   │   │   ├── User.ts                  # User schema
│   │   │   └── DiaryEntry.ts            # Diary entry schema
│   │   ├── mongodb.ts                   # DB connection
│   │   └── openai.ts                    # AI response generation
│   └── middleware.ts                    # Route protection
├── public/                              # Static assets
├── .env.example                         # Environment variables template
└── package.json                         # Dependencies
```

## Deployment

### Environment Variables (Required)

Set these in your deployment platform:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Strong random string for JWT signing

### Build the application

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Recommended Platforms

- **Vercel:** Easiest for Next.js (zero-config deployment)
- **Railway:** Good for full-stack with MongoDB
- **Render:** Free tier available
- **Self-hosted:** Any Node.js hosting platform

### MongoDB Setup

- **Development:** Local MongoDB or MongoDB Atlas free tier
- **Production:** MongoDB Atlas (recommended) or self-hosted MongoDB

## Security

- ✅ Passwords hashed with bcrypt (12 salt rounds)
- ✅ JWT tokens stored in HTTP-only cookies (XSS protection)
- ✅ 7-day token expiry (balancing security and UX)
- ✅ User data strictly isolated per user ID
- ✅ OpenAI API keys stored only in browser (never server-side)
- ✅ Input validation on all endpoints
- ✅ CORS configured for same-origin
- ✅ Protected routes via middleware

## Troubleshooting

### "Cannot connect to MongoDB"

- Verify `MONGODB_URI` is correct in `.env.local`
- Ensure MongoDB is running (local) or accessible (Atlas)
- Check network/firewall settings

### "JWT_SECRET not defined"

- Ensure `.env.local` file exists
- Verify `JWT_SECRET` is set (use `openssl rand -base64 32` to generate)
- Restart dev server after adding env vars

### "Invalid API key" error when writing diary

- Go to Settings and verify your OpenAI API key
- Ensure key starts with "sk-"
- Check key is active at https://platform.openai.com/
- Verify you have API credits available

### Build errors

- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Ensure Node.js version is 18+

## License

This project is private and personal. Please respect the privacy-focused design.

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [OpenAI](https://openai.com/)
