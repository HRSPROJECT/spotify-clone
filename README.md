# 🎵 Spotify Clone

A full-featured Spotify clone with music streaming, playlists, and recommendations.

**Tech Stack:**
- **Backend API:** Python FastAPI + YouTube Music API
- **Frontend:** React + Vite
- **Database/Auth:** Supabase (free tier)
- **Hosting:** Google Cloud Run (free tier)

---

## 📁 Project Structure

```
spotify clone/
├── api/                    # Backend API (single Python file)
│   ├── main.py            # All API endpoints
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile         # For Cloud Run deployment
│   └── HOSTING.md         # Deployment instructions
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store.js       # State management (Zustand)
│   │   ├── api.js         # API helper functions
│   │   └── config.js      # Supabase/API configuration
│   └── .env.example       # Environment variables template
└── supabase_schema.sql    # Database schema
```

---

## 🚀 Quick Start

### 1. Setup Supabase (Database & Auth)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** and run the contents of `supabase_schema.sql`
4. Go to **Settings > API** and copy:
   - Project URL
   - anon/public key

### 2. Run Backend Locally

```bash
cd "spotify clone/api"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py
```

API will be at: http://localhost:8080

### 3. Run Frontend Locally

```bash
cd "spotify clone/frontend"

# Copy env file and add your Supabase credentials
cp .env.example .env
# Edit .env with your values

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend will be at: http://localhost:5173

---

## ☁️ Deploy to Google Cloud (FREE!)

### Deploy API to Cloud Run

```bash
cd "spotify clone/api"

# Install Google Cloud CLI (if not installed)
brew install google-cloud-sdk

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy (one command!)
gcloud run deploy spotify-api \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2
```

You'll get a URL like: `https://spotify-api-xxxxx.run.app`

### Deploy Frontend

Option 1: **Vercel** (Recommended, easiest)
```bash
npm install -g vercel
cd frontend
vercel
```

Option 2: **Netlify**
```bash
npm run build
# Upload dist folder to netlify.com
```

Option 3: **Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## 🎯 Features

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /search?q=query` | Search songs |
| `GET /search/all?q=query` | Search songs, artists, albums |
| `GET /stream/{videoId}` | Get audio stream URL |
| `GET /song/{videoId}` | Get song details |
| `GET /related/{videoId}` | Get related/similar songs |
| `GET /lyrics/{videoId}` | Get song lyrics |
| `GET /artist/{browseId}` | Get artist with songs |
| `GET /album/{browseId}` | Get album with tracks |
| `GET /trending` | Get trending songs |
| `GET /genres` | List all genres |
| `GET /genre/{id}` | Get songs by genre |

### Frontend Features

- 🔍 Search songs, artists, albums
- 🎵 Full audio playback with controls
- ❤️ Like/save songs (requires login)
- 📝 Create and manage playlists
- 📊 Listening history
- 🎨 Beautiful Spotify-like UI
- 📱 Responsive design

---

## 💰 Cost: $0/month

**Google Cloud Run Free Tier:**
- 2 million requests/month
- 360,000 GB-seconds memory
- 180,000 vCPU-seconds

**Supabase Free Tier:**
- 500MB database
- 50,000 monthly active users
- Unlimited API requests

**Vercel/Netlify Free Tier:**
- Unlimited static hosting
- 100GB bandwidth/month

---

## 🔧 Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-api.run.app
```

---

## 📝 Notes

- This is for **educational purposes only**
- Audio is streamed from YouTube Music
- No audio files are stored on our servers
- Respect copyright and terms of service

---

## 🐛 Troubleshooting

**API not working?**
- Check if `ytmusicapi` is installed correctly
- Some songs may not have audio available
- Check Cloud Run logs: `gcloud run logs read --service spotify-api`

**Audio not playing?**
- Stream URLs expire after ~30 minutes
- Try refreshing the page
- Check browser console for errors

**Auth not working?**
- Verify Supabase credentials in .env
- Check Supabase dashboard for error logs
- Make sure email confirmation is enabled/disabled as needed

---

Built with ❤️ for educational purposes
