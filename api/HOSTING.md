# Spotify Clone API - Hosting Guide

## 🚀 Deploy to Render.com (Recommended - FREE)

Render.com offers a generous free tier perfect for this API.

### Step-by-Step Deployment:

#### 1. **Prepare Your Repository**
First, push your `api` folder to GitHub:

```bash
cd "/Users/harsheetgundecha2007/spotify clone"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/spotify-clone.git
git push -u origin main
```

#### 2. **Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended for easy repo access)

#### 3. **Create New Web Service**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `spotify-clone-api` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | `api` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | `Free` |

4. Click **"Create Web Service"**

#### 4. **Wait for Deployment**
- First deploy takes ~5-10 minutes
- Render will install dependencies and start your API
- You'll get a URL like: `https://spotify-clone-api-xxxx.onrender.com`

#### 5. **Test Your API**
Open your API URL in browser. You should see:
```json
{
  "name": "Spotify Clone API",
  "version": "1.0.0",
  "endpoints": {...}
}
```

---

## ⚠️ Free Tier Limitations

| Limitation | Details |
|------------|---------|
| **Sleep after inactivity** | Service sleeps after 15 minutes of no requests. First request after sleep takes ~30-50 seconds to "wake up" |
| **750 hours/month** | Plenty for a single service running 24/7 |
| **Limited CPU/RAM** | 512MB RAM, shared CPU - sufficient for this API |

### 💡 Tips to Improve Performance:
1. **Use caching** (already implemented in your API!)
2. **Add a health check ping** - Use services like UptimeRobot to ping your `/health` endpoint every 14 minutes to prevent sleep

---

## 🔧 Update Your Frontend

After deployment, update your frontend to use the Render URL:

**In `frontend/src/lib/api.js` or equivalent:**
```javascript
const API_URL = 'https://spotify-clone-api-xxxx.onrender.com';
```

Replace `xxxx` with your actual Render subdomain.

---

## 🔄 Auto-Deploy

Render automatically deploys when you push to your connected GitHub branch!

```bash
git add .
git commit -m "Update API"
git push
```

---

## 📊 Monitoring

- View logs in Render Dashboard → Your Service → "Logs"
- Check metrics in "Metrics" tab
- Set up alerts for failures

---

## 🆚 Alternative: Google Cloud Run

If you need more power or want to use Docker:

```bash
# Install gcloud CLI, then:
cd api
gcloud run deploy spotify-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

Cloud Run offers:
- 2 million free requests/month
- Scales to zero (no charge when idle)
- Better cold start times

---

## 🔗 Quick Links

- [Render Dashboard](https://dashboard.render.com)
- [Render Python Docs](https://render.com/docs/deploy-fastapi)
- [API Health Check](https://YOUR-APP.onrender.com/health)
