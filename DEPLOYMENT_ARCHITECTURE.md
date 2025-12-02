# Smart Classroom - Deployment Architecture

## 🌐 Global Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTERNET (Global Access)                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ↓                 ↓                 ↓
            ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
            │   ESP32       │ │  Web Browser  │ │ Mobile Device │
            │   Device      │ │  (Students)   │ │   (Admin)     │
            │               │ │               │ │               │
            │ 📡 WiFi       │ │ 💻 Desktop    │ │ 📱 Phone      │
            │ 🔖 RFID       │ │ 🌐 Any OS     │ │ 📲 Tablet     │
            └───────────────┘ └───────────────┘ └───────────────┘
                    │                 │                 │
                    │    HTTPS        │    HTTPS        │    HTTPS
                    │    Requests     │    Requests     │    Requests
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ↓                 ↓                 ↓
        ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
        │   BACKEND API     │ │   FRONTEND APP    │ │    DATABASE       │
        │   (Render.com)    │ │   (Vercel.com)    │ │   (Supabase)      │
        │                   │ │                   │ │                   │
        │ 🟢 Node.js        │ │ ⚛️  React         │ │ 🐘 PostgreSQL     │
        │ 🚀 Express        │ │ ⚡ Vite           │ │ ☁️  Cloud         │
        │ 🔐 JWT Auth       │ │ 🎨 Tailwind       │ │ 🔒 RLS            │
        │ 📊 Data Structs   │ │ 📱 Responsive     │ │ 💾 500MB Free     │
        │                   │ │                   │ │                   │
        │ Free Tier:        │ │ Free Tier:        │ │ Free Tier:        │
        │ 750 hrs/month     │ │ Unlimited         │ │ 2GB bandwidth     │
        └───────────────────┘ └───────────────────┘ └───────────────────┘
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      │
                            ┌─────────┴─────────┐
                            │                   │
                            ↓                   ↓
                    ┌───────────────┐   ┌───────────────┐
                    │  Cron Job     │   │  GitHub       │
                    │  (Keep Awake) │   │  (Code Repo)  │
                    │               │   │               │
                    │ ⏰ Every 10min│   │ 📦 Version    │
                    │ 🔄 Ping API   │   │ 🔄 Auto Deploy│
                    └───────────────┘   └───────────────┘
```

---

## 🔄 Data Flow Diagram

### 1. RFID Scan Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RFID Attendance Flow                         │
└─────────────────────────────────────────────────────────────────┘

Step 1: Student Scans Card
┌──────────────┐
│   ESP32      │
│   Device     │  ← Student scans RFID card
│              │
│ 🔖 RFID      │
│ UID: 0BBCCE31│
└──────┬───────┘
       │
       │ WiFi Connection
       │
       ↓
Step 2: Send to Backend
┌──────────────────────────────────────┐
│ POST /api/attendance                 │
│ {                                    │
│   "uid": "0BBCCE31"                  │
│ }                                    │
└──────┬───────────────────────────────┘
       │
       │ HTTPS Request
       │
       ↓
Step 3: Backend Processing
┌──────────────────────────────────────┐
│ Backend API (Render)                 │
│                                      │
│ 1. Receive request                   │
│ 2. Check if student exists           │
│    (B-Tree index lookup - O(log n))  │
│                                      │
│ ┌─────────────┐                     │
│ │ Found?      │                     │
│ └─────┬───────┘                     │
│       │                              │
│   ┌───┴───┐                         │
│   │       │                          │
│  YES     NO                          │
│   │       │                          │
│   ↓       ↓                          │
│ Log     Add to                       │
│ Attend  Queue                        │
│ ance    (Linked                      │
│         List)                        │
└──────┬───────────────────────────────┘
       │
       │ Database Query
       │
       ↓
Step 4: Store in Database
┌──────────────────────────────────────┐
│ Supabase PostgreSQL                  │
│                                      │
│ INSERT INTO attendance_logs          │
│ (student_uid, timestamp, status)     │
│ VALUES ('0BBCCE31', NOW(), 'present')│
│                                      │
│ ✅ Attendance recorded               │
└──────┬───────────────────────────────┘
       │
       │ Response
       │
       ↓
Step 5: Confirmation
┌──────────────────────────────────────┐
│ ESP32 Device                         │
│                                      │
│ ✅ Success!                          │
│ 💚 Green LED blinks                  │
│ 📊 Serial: "Attendance logged"       │
└──────────────────────────────────────┘
       │
       │ Real-time Update
       │
       ↓
Step 6: Student Views
┌──────────────────────────────────────┐
│ Frontend (Vercel)                    │
│                                      │
│ Student Dashboard:                   │
│ ┌────────────────────────────────┐  │
│ │ My Attendance                  │  │
│ │                                │  │
│ │ Total: 25/50 (50%)             │  │
│ │                                │  │
│ │ Recent:                        │  │
│ │ ✓ Today 09:00 - Present        │  │
│ │ ✓ Yesterday 09:00 - Present    │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 🏗️ Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                    Component Interaction                        │
└─────────────────────────────────────────────────────────────────┘

Frontend (React)
    │
    │ 1. User Login
    ↓
┌─────────────────────┐
│ Supabase Auth       │ ← JWT Token
└─────────────────────┘
    │
    │ 2. Fetch Data
    ↓
┌─────────────────────┐
│ Backend API         │
│ (with JWT)          │
└─────────────────────┘
    │
    │ 3. Query Database
    ↓
┌─────────────────────┐
│ Supabase DB         │
│ (with RLS)          │
└─────────────────────┘
    │
    │ 4. Return Data
    ↓
┌─────────────────────┐
│ Frontend            │
│ (Display)           │
└─────────────────────┘

ESP32 (RFID)
    │
    │ 1. Scan Card
    ↓
┌─────────────────────┐
│ Read UID            │
└─────────────────────┘
    │
    │ 2. Send to API
    ↓
┌─────────────────────┐
│ Backend API         │
│ (No Auth Required)  │
└─────────────────────┘
    │
    │ 3. Process
    ↓
┌─────────────────────┐
│ Queue/Database      │
└─────────────────────┘
```

---

## 🌍 Geographic Distribution

```
┌─────────────────────────────────────────────────────────────────┐
│                    Global Distribution                          │
└─────────────────────────────────────────────────────────────────┘

                        🌐 Internet

        ┌───────────────┼───────────────┐
        │               │               │
        ↓               ↓               ↓
    
🇺🇸 USA (Oregon)   🇺🇸 USA (SF)    🇺🇸 USA (AWS)
Render Backend     Vercel CDN      Supabase DB
                   
- Node.js API      - Static Files  - PostgreSQL
- REST Endpoints   - React App     - Data Storage
- Always Available - Edge Network  - Backups
- Free Tier        - Global CDN    - Free Tier

        │               │               │
        └───────────────┼───────────────┘
                        │
                        ↓
                        
            📡 Accessible Worldwide
            
        ┌───────────────┼───────────────┐
        │               │               │
        ↓               ↓               ↓
        
    🏫 School       🏠 Home        📱 Mobile
    ESP32           Students       Admin
    WiFi            Browser        App
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Architecture                        │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Transport Security
┌──────────────────────────────────────┐
│ HTTPS/TLS Encryption                 │
│ ✓ All traffic encrypted              │
│ ✓ SSL certificates (automatic)       │
│ ✓ Secure WebSocket connections       │
└──────────────────────────────────────┘
                │
                ↓
Layer 2: Application Security
┌──────────────────────────────────────┐
│ CORS Protection                      │
│ ✓ Whitelisted domains only           │
│ ✓ No unauthorized access             │
│                                      │
│ JWT Authentication                   │
│ ✓ Token-based auth                   │
│ ✓ Expiring tokens                    │
│ ✓ Refresh mechanism                  │
└──────────────────────────────────────┘
                │
                ↓
Layer 3: Database Security
┌──────────────────────────────────────┐
│ Row Level Security (RLS)             │
│ ✓ Students see only their data       │
│ ✓ Admin has full access              │
│ ✓ Policy-based access control        │
│                                      │
│ Encrypted at Rest                    │
│ ✓ Database encryption                │
│ ✓ Backup encryption                  │
└──────────────────────────────────────┘
                │
                ↓
Layer 4: Environment Security
┌──────────────────────────────────────┐
│ Environment Variables                │
│ ✓ No hardcoded secrets               │
│ ✓ Secure key storage                 │
│ ✓ Separate dev/prod configs          │
└──────────────────────────────────────┘
```

---

## 📊 Data Structure Usage

```
┌─────────────────────────────────────────────────────────────────┐
│              Data Structures in Production                      │
└─────────────────────────────────────────────────────────────────┘

Backend Memory:
┌──────────────────────────────────────┐
│ Linked List Queue                    │
│ ┌───┐  ┌───┐  ┌───┐                 │
│ │ A │→│ B │→│ C │                 │
│ └───┘  └───┘  └───┘                 │
│ Pending RFID Scans (FIFO)            │
│ O(1) enqueue/dequeue                 │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│ Circular Buffer                      │
│     ┌───┐                            │
│  ┌─→│ 5 │←─┐                         │
│  │  └───┘  │                         │
│┌───┐     ┌───┐                       │
││ 4 │     │ 1 │                       │
│└───┘     └───┘                       │
│  │  ┌───┐  │                         │
│  └─→│ 3 │←─┘                         │
│     └───┘                            │
│ Activity Log (Last 50)               │
│ O(1) add, Fixed memory               │
└──────────────────────────────────────┘

Database:
┌──────────────────────────────────────┐
│ B-Tree Indexes                       │
│         [M]                          │
│        /   \                         │
│      [D]   [T]                       │
│     /  \   /  \                      │
│  [A,B][E,F][N,O][U,V]                │
│                                      │
│ Fast lookups: O(log n)               │
│ Used for: UID, timestamp queries     │
└──────────────────────────────────────┘
```

---

## 🔄 Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline                               │
└─────────────────────────────────────────────────────────────────┘

Developer
    │
    │ git push
    ↓
┌─────────────────────┐
│ GitHub Repository   │
│ ✓ Code stored       │
│ ✓ Version control   │
└─────────────────────┘
    │
    ├──────────────────┬──────────────────┐
    │                  │                  │
    ↓                  ↓                  ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Render      │  │ Vercel      │  │ Supabase    │
│ Auto Deploy │  │ Auto Deploy │  │ Manual      │
└─────────────┘  └─────────────┘  └─────────────┘
    │                  │                  │
    │ Build            │ Build            │ Migrations
    │ npm install      │ npm run build    │ SQL scripts
    │ npm start        │                  │
    │                  │                  │
    ↓                  ↓                  ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Backend     │  │ Frontend    │  │ Database    │
│ Live ✅     │  │ Live ✅     │  │ Live ✅     │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 💰 Cost Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cost Breakdown                               │
└─────────────────────────────────────────────────────────────────┘

Free Tier (Current):
┌──────────────────────────────────────┐
│ Render:      $0/month                │
│ - 750 hours (enough for 1 service)   │
│ - Spins down after 15 min            │
│ - 512MB RAM                          │
│                                      │
│ Vercel:      $0/month                │
│ - Unlimited deployments              │
│ - 100GB bandwidth                    │
│ - Global CDN                         │
│                                      │
│ Supabase:    $0/month                │
│ - 500MB database                     │
│ - 2GB bandwidth                      │
│ - Unlimited API requests             │
│                                      │
│ Cron-job:    $0/month                │
│ - Unlimited cron jobs                │
│                                      │
│ TOTAL:       $0/month ✅             │
└──────────────────────────────────────┘

Paid Tier (When Scaling):
┌──────────────────────────────────────┐
│ Render:      $7/month                │
│ - Always-on (no sleep)               │
│ - 512MB RAM                          │
│                                      │
│ Vercel:      $20/month               │
│ - Team features                      │
│ - Advanced analytics                 │
│                                      │
│ Supabase:    $25/month               │
│ - 8GB database                       │
│ - 50GB bandwidth                     │
│ - Daily backups                      │
│                                      │
│ TOTAL:       $52/month               │
└──────────────────────────────────────┘
```

---

## 🎯 Performance Metrics

```
┌─────────────────────────────────────────────────────────────────┐
│                    Performance Targets                          │
└─────────────────────────────────────────────────────────────────┘

Response Times:
┌──────────────────────────────────────┐
│ Frontend Load:     < 2 seconds       │
│ API Response:      < 1 second        │
│ Database Query:    < 100ms           │
│ ESP32 Scan:        < 3 seconds       │
│ Wake-up Time:      ~30 seconds       │
└──────────────────────────────────────┘

Capacity:
┌──────────────────────────────────────┐
│ Students:          Unlimited*        │
│ Concurrent Users:  100+              │
│ RFID Scans/day:    Unlimited         │
│ Attendance Records: Millions         │
│                                      │
│ *Limited by 500MB database           │
└──────────────────────────────────────┘

Availability:
┌──────────────────────────────────────┐
│ Uptime:            99.9%             │
│ (excluding 30s wake-up)              │
│                                      │
│ Maintenance:       Automatic         │
│ Backups:           Daily             │
│ SSL Renewal:       Automatic         │
└──────────────────────────────────────┘
```

---

## ✅ Deployment Checklist Summary

```
Pre-Deployment:
☐ GitHub repository created
☐ Code committed
☐ Environment variables documented

Backend (Render):
☐ Account created
☐ Service deployed
☐ Environment variables set
☐ Health check working

Frontend (Vercel):
☐ Account created
☐ Project deployed
☐ Environment variables set
☐ Site accessible

Database (Supabase):
☑ Already set up ✅
☐ Tables verified
☐ RLS policies configured

ESP32:
☐ Code updated with URLs
☐ WiFi credentials set
☐ Uploaded and tested

Monitoring:
☐ Cron job set up
☐ Dashboards bookmarked
☐ Alerts configured

Testing:
☐ End-to-end test passed
☐ All features working
☐ No errors in logs
```

---

**Ready to deploy? Follow `QUICK_DEPLOY.md` for step-by-step instructions!** 🚀
