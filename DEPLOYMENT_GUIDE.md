# Smart Classroom System - Free Deployment Guide

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Overview                      │
└─────────────────────────────────────────────────────────────┘

ESP32 Device (Anywhere)
     │
     │ HTTPS Request
     ↓
Backend API (Render/Railway)
     │
     │ PostgreSQL Connection
     ↓
Database (Supabase)
     ↑
     │ API Calls
Frontend (Vercel/Netlify)
```

---

## 🆓 Free Hosting Options

### Option 1: Recommended Stack (Best for ESP32)

| Component | Service | Free Tier | Why? |
|-----------|---------|-----------|------|
| **Frontend** | Vercel | Unlimited | Fast, auto-deploy from Git |
| **Backend** | Render | 750 hrs/month | Always-on, public URL for ESP32 |
| **Database** | Supabase | 500MB, 2GB bandwidth | Already using it! |

### Option 2: Alternative Stack

| Component | Service | Free Tier | Why? |
|-----------|---------|-----------|------|
| **Frontend** | Netlify | 100GB bandwidth | Easy setup |
| **Backend** | Railway | $5 credit/month | Good performance |
| **Database** | Supabase | 500MB, 2GB bandwidth | Same as above |

---

## 📋 Step-by-Step Deployment

### Phase 1: Database (Already Done ✅)

Your Supabase database is already set up and accessible from anywhere!

**Verify**:
- ✅ Supabase project created
- ✅ Tables created (students, attendance_logs, rooms, timetable)
- ✅ API keys available

---

### Phase 2: Deploy Backend (Node.js API)

#### Option A: Deploy to Render (Recommended)

**Step 1: Prepare Backend**

Create `backend/render.yaml`:
```yaml
services:
  - type: web
    name: smart-classroom-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
```

**Step 2: Update package.json**

Ensure your `backend/package.json` has:
```json
{
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "node index.js"
  }
}
```

**Step 3: Deploy to Render**

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: smart-classroom-api
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

6. Add Environment Variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3000
   NODE_ENV=production
   ```

7. Click "Create Web Service"

**Your backend will be available at**: `https://smart-classroom-api.onrender.com`

⚠️ **Important for ESP32**: Render free tier spins down after 15 minutes of inactivity. It takes ~30 seconds to wake up.

**Solution**: Use a cron job to ping your API every 10 minutes (see below).

---

#### Option B: Deploy to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables (same as Render)
6. Deploy!

**Your backend will be available at**: `https://smart-classroom-api.up.railway.app`

---

### Phase 3: Deploy Frontend (React)

#### Option A: Deploy to Vercel (Recommended)

**Step 1: Prepare Frontend**

Create `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://smart-classroom-api.onrender.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Step 2: Update vite.config.js**

Ensure `frontend/vite.config.js` has:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
```

**Step 3: Deploy to Vercel**

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist

6. Add Environment Variables:
   ```
   VITE_API_BASE_URL=https://smart-classroom-api.onrender.com
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

7. Click "Deploy"

**Your frontend will be available at**: `https://smart-classroom.vercel.app`

---

#### Option B: Deploy to Netlify

1. Go to https://netlify.com
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Configure:
   - **Base directory**: frontend
   - **Build command**: `npm run build`
   - **Publish directory**: frontend/dist

6. Add environment variables (same as Vercel)
7. Deploy!

---

### Phase 4: Configure ESP32

**Update ESP32 Code**

In your `esp32_rfid_attendance.ino`:

```cpp
// Replace localhost with your deployed backend URL
const char* serverUrl = "https://smart-classroom-api.onrender.com/api/attendance";

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Initialize RFID reader
  SPI.begin();
  mfrc522.PCD_Init();
}

void sendAttendance(String uid) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Use HTTPS for deployed backend
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String jsonPayload = "{\"uid\":\"" + uid + "\"}";
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error: " + String(httpResponseCode));
    }
    
    http.end();
  }
}
```

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS Settings

In `backend/index.js`, update CORS to allow your frontend domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://smart-classroom.vercel.app',
    'http://localhost:5173' // For local development
  ],
  credentials: true
}));
```

### 2. Keep Render Backend Awake

**Option A: Use Cron-job.org (Free)**

1. Go to https://cron-job.org
2. Sign up for free
3. Create a new cron job:
   - **URL**: `https://smart-classroom-api.onrender.com/api/health`
   - **Schedule**: Every 10 minutes
   - **Method**: GET

**Option B: Create Health Check Endpoint**

Add to `backend/index.js`:

```javascript
// Health check endpoint for keeping server awake
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 3. Set Up Custom Domain (Optional)

**Vercel**:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**Render**:
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records

---

## 🌐 Final URLs

After deployment, you'll have:

```
Frontend:  https://smart-classroom.vercel.app
Backend:   https://smart-classroom-api.onrender.com
Database:  https://your-project.supabase.co (already set up)

ESP32 connects to: https://smart-classroom-api.onrender.com/api/attendance
```

---

## 📱 ESP32 Connection from Anywhere

### Requirements:
1. ✅ ESP32 connected to WiFi
2. ✅ Backend has public HTTPS URL
3. ✅ No authentication required for `/api/attendance` endpoint

### How it Works:

```
┌─────────────────────────────────────────────────────────────┐
│  ESP32 (School/Home/Anywhere with WiFi)                     │
│                                                             │
│  1. Scan RFID card                                          │
│  2. Connect to WiFi                                         │
│  3. Send HTTPS POST to backend                              │
│  4. Backend processes and stores in Supabase                │
│  5. Students can view attendance from anywhere              │
└─────────────────────────────────────────────────────────────┘
```

### Testing ESP32 Connection:

```cpp
void testConnection() {
  Serial.println("Testing backend connection...");
  
  HTTPClient http;
  http.begin("https://smart-classroom-api.onrender.com/api/health");
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    Serial.println("✓ Backend is reachable!");
  } else {
    Serial.println("✗ Cannot reach backend");
    Serial.println("Error code: " + String(httpCode));
  }
  
  http.end();
}
```

---

## 💰 Cost Breakdown (All Free!)

| Service | Free Tier | Limits | Enough? |
|---------|-----------|--------|---------|
| **Vercel** | Unlimited | 100GB bandwidth/month | ✅ Yes |
| **Render** | 750 hours | Spins down after 15 min | ✅ Yes (with cron) |
| **Supabase** | 500MB DB | 2GB bandwidth/month | ✅ Yes for small school |
| **Total** | **$0/month** | - | ✅ Perfect for MVP |

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables documented
- [ ] Database migrations run on Supabase
- [ ] CORS configured for production domains
- [ ] Health check endpoint added

### Backend Deployment
- [ ] Render/Railway account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Backend deployed and accessible
- [ ] Test API endpoints with Postman/curl

### Frontend Deployment
- [ ] Vercel/Netlify account created
- [ ] Repository connected
- [ ] Environment variables set (with backend URL)
- [ ] Frontend deployed and accessible
- [ ] Test login and features

### ESP32 Configuration
- [ ] Backend URL updated in ESP32 code
- [ ] WiFi credentials set
- [ ] HTTPS connection tested
- [ ] RFID scan tested with deployed backend

### Post-Deployment
- [ ] Cron job set up to keep backend awake
- [ ] Custom domains configured (optional)
- [ ] SSL certificates verified (automatic)
- [ ] All features tested end-to-end

---

## 🔍 Troubleshooting

### Issue: ESP32 can't connect to backend

**Solution**:
1. Check if backend URL is correct (HTTPS, not HTTP)
2. Verify WiFi connection on ESP32
3. Test backend URL in browser
4. Check if Render service is awake (visit URL in browser first)

### Issue: Frontend can't reach backend

**Solution**:
1. Check CORS settings in backend
2. Verify API_BASE_URL in frontend .env
3. Check browser console for errors
4. Ensure backend is deployed and running

### Issue: Render backend keeps sleeping

**Solution**:
1. Set up cron job to ping every 10 minutes
2. Consider upgrading to paid plan ($7/month for always-on)
3. Or use Railway (better free tier)

### Issue: Database connection fails

**Solution**:
1. Verify Supabase credentials
2. Check if IP is whitelisted (Supabase allows all by default)
3. Test connection with Supabase dashboard

---

## 📊 Monitoring

### Free Monitoring Tools:

1. **Render Dashboard**: View logs and metrics
2. **Vercel Analytics**: Track frontend performance
3. **Supabase Dashboard**: Monitor database usage
4. **UptimeRobot** (free): Monitor uptime and get alerts

---

## 🎓 Next Steps

1. **Deploy backend to Render** (15 minutes)
2. **Deploy frontend to Vercel** (10 minutes)
3. **Update ESP32 code** (5 minutes)
4. **Set up cron job** (5 minutes)
5. **Test end-to-end** (10 minutes)

**Total time: ~45 minutes** ⏱️

---

## 🌟 Production-Ready Enhancements (Future)

When you're ready to scale:

1. **Upgrade Render**: $7/month for always-on backend
2. **Add Redis**: Cache frequently accessed data
3. **CDN**: CloudFlare for faster global access
4. **Monitoring**: Sentry for error tracking
5. **Backups**: Automated database backups
6. **Load Balancer**: Handle more ESP32 devices

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **ESP32 HTTPS**: https://randomnerdtutorials.com/esp32-https-requests/

---

## ✅ Summary

Your Smart Classroom system can be deployed **100% free** with:

- ✅ **Global accessibility** (HTTPS URLs)
- ✅ **ESP32 connectivity** from anywhere with WiFi
- ✅ **Automatic deployments** from Git
- ✅ **SSL certificates** (automatic)
- ✅ **Scalable architecture** (can upgrade later)

**Total Cost: $0/month** 🎉

The system will be accessible 24/7 from anywhere in the world, and your ESP32 can connect from any WiFi network!
