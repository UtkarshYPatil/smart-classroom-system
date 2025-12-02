# Quick Deployment Guide - 5 Steps

## 🚀 Deploy in 15 Minutes

### Step 1: Deploy Backend to Render (5 min)

1. Go to https://render.com and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your repository
4. Fill in:
   ```
   Name: smart-classroom-api
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```
5. Add environment variables:
   ```
   SUPABASE_URL=<your_supabase_url>
   SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_key>
   SUPABASE_ANON_KEY=<your_supabase_anon_key>
   PORT=10000
   NODE_ENV=production
   ```
6. Click **"Create Web Service"**
7. Wait 3-5 minutes for deployment
8. Copy your backend URL: `https://smart-classroom-api-xxxx.onrender.com`

---

### Step 2: Deploy Frontend to Vercel (5 min)

1. Go to https://vercel.com and sign up with GitHub
2. Click **"Add New"** → **"Project"**
3. Import your repository
4. Fill in:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
5. Add environment variables:
   ```
   VITE_API_BASE_URL=https://smart-classroom-api-xxxx.onrender.com
   VITE_SUPABASE_URL=<your_supabase_url>
   VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
   ```
6. Click **"Deploy"**
7. Wait 2-3 minutes
8. Copy your frontend URL: `https://smart-classroom-xxxx.vercel.app`

---

### Step 3: Keep Backend Awake (2 min)

1. Go to https://cron-job.org and sign up
2. Create new cron job:
   ```
   Title: Keep Smart Classroom API Awake
   URL: https://smart-classroom-api-xxxx.onrender.com/api/health
   Schedule: */10 * * * * (Every 10 minutes)
   ```
3. Save and enable

---

### Step 4: Update ESP32 Code (2 min)

In your Arduino IDE, update:

```cpp
// WiFi credentials
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend URL (replace with your Render URL)
const char* serverUrl = "https://smart-classroom-api-xxxx.onrender.com/api/attendance";
```

Upload to ESP32 and test!

---

### Step 5: Test Everything (1 min)

1. **Test Frontend**: Visit your Vercel URL and login
2. **Test Backend**: Visit `https://your-backend-url.onrender.com/api/health`
3. **Test ESP32**: Scan an RFID card and check if attendance is logged

---

## ✅ Done!

Your system is now live and accessible from anywhere! 🎉

**URLs to save**:
- Frontend: `https://smart-classroom-xxxx.vercel.app`
- Backend: `https://smart-classroom-api-xxxx.onrender.com`
- Database: Already on Supabase ✅

---

## 🔧 Troubleshooting

**Backend not responding?**
- Visit the URL in browser to wake it up (Render free tier sleeps after 15 min)
- Check if cron job is running

**Frontend can't connect to backend?**
- Check CORS settings in `backend/index.js`
- Verify `VITE_API_BASE_URL` in Vercel environment variables

**ESP32 can't connect?**
- Check WiFi credentials
- Verify backend URL (must be HTTPS)
- Test backend URL in browser first

---

## 📞 Need Help?

Check the full guide: `DEPLOYMENT_GUIDE.md`
