# Pinks Hub — Deployment Guide
# One login. Everything in one place.
# Built for Chris Pink · Pinks Associates · FCA No: 705091

---

## What You've Got

A complete business hub with:
- **Dashboard** — Kanban pipeline overview, metrics, commission tracking, upcoming posts
- **CRM Pipeline** — Drag-and-drop Kanban board, colour-coded by product type, lead notes
- **Content Hub** — Write once, AI-generates versions for all platforms, schedule Tu/Thu
- **Content Calendar** — Monthly view, visual scheduling, post management
- **All Leads** — Searchable table, filter by product/stage, CSV export

---

## Step 1: Set Up Supabase (10 minutes)

1. Go to **supabase.com** → Sign up (free)
2. Click **New Project**
   - Name: `pinks-hub`
   - Database password: choose something strong (save it)
   - Region: **West EU (Ireland)** — closest to Chichester
3. Wait ~2 minutes for project to spin up
4. Go to **SQL Editor** (left sidebar)
5. Click **New Query**
6. Open the file `supabase-schema.sql` from this folder
7. Copy the entire contents and paste into the SQL editor
8. Click **Run** — you should see "Success"
9. Go to **Settings → API**
10. Copy:
    - **Project URL** (looks like: https://abcdefgh.supabase.co)
    - **anon/public key** (long string starting with eyJ...)
    - Save both — you'll need them in Step 3

### Create your login account

1. In Supabase, go to **Authentication → Users**
2. Click **Add User → Create new user**
3. Enter your email and a strong password
4. Click **Create User**
5. This is how you'll log into Pinks Hub

---

## Step 2: Set Up GitHub (5 minutes)

1. Go to **github.com** → Sign up if needed (free)
2. Click **New Repository**
   - Name: `pinks-hub`
   - Private: Yes
   - Don't add README
3. Click **Create Repository**
4. You'll see a page with setup instructions — keep this open

On your computer (in Terminal / Command Prompt):
```bash
cd pinks-hub        # navigate to this folder
npm install         # install dependencies (takes 1-2 min)
git init
git add .
git commit -m "Initial build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pinks-hub.git
git push -u origin main
```

---

## Step 3: Deploy to Vercel (5 minutes)

You already have a Vercel account (pinks-crm-live is there). Use that.

1. Go to **vercel.com** → your dashboard
2. Click **Add New → Project**
3. Import your `pinks-hub` GitHub repository
4. In **Environment Variables**, add:
   ```
   VITE_SUPABASE_URL       = (your Supabase Project URL from Step 1)
   VITE_SUPABASE_ANON_KEY  = (your Supabase anon key from Step 1)
   ```
5. Click **Deploy**
6. Wait ~2 minutes
7. You'll get a live URL: `https://pinks-hub.vercel.app` (or similar)

**Custom domain** (optional but recommended):
- In Vercel → your project → Settings → Domains
- Add: `hub.pinksassociates.com` (or similar)
- Add a CNAME record in your DNS provider pointing to Vercel

---

## Step 4: Log In

1. Go to your live URL
2. Enter the email and password you created in Supabase (Step 1)
3. You're in

---

## How To Use It

### Adding a lead
- Click **CRM Pipeline** → **+ Add Lead**
- Fill in name, product type, potential commission
- Lead appears in **New Enquiry** column
- Drag it across the board as the deal progresses

### Creating content
- Click **Content Hub**
- Write your core message in the text area
- Select which platforms to post to
- Click **Generate** — AI writes a version for each platform
- Review and edit each version
- Click **Schedule** → pick a Tuesday or Thursday slot
- Post appears in your Content Calendar

### Tracking commission
- When adding/editing a lead, enter the potential commission value
- Dashboard shows total potential commission across all active leads
- Filter by product type to see commission by category

### Exporting leads
- Go to **All Leads**
- Filter as needed
- Click **Export CSV** — downloads to your computer

---

## Future Additions (Phase 2)

When you're ready, these can be added without rebuilding:
- **Direct social media publishing** (LinkedIn OAuth, Meta Graph API, TikTok API)
- **FUNDMC integration** (leads from pre-qual tool auto-populate CRM)
- **Email notifications** (new lead → email to chris@pinksassociates.com)
- **WordPress auto-publish** (scheduled post → WordPress REST API)
- **Google Business Profile posting** (GBP API)
- **VA access** (separate login with limited permissions)

Each of these is a self-contained addition — none require rebuilding the core system.

---

## File Structure

```
pinks-hub/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx     — Login/session management
│   ├── components/
│   │   └── Layout.jsx          — Sidebar navigation shell
│   ├── lib/
│   │   └── supabase.js         — Database client + constants
│   ├── pages/
│   │   ├── Login.jsx           — Login screen
│   │   ├── Dashboard.jsx       — Main overview + metrics
│   │   ├── CRMBoard.jsx        — Kanban pipeline
│   │   ├── ContentHub.jsx      — Write + generate + schedule
│   │   ├── ContentCalendar.jsx — Monthly calendar view
│   │   └── AllLeads.jsx        — Searchable leads table
│   ├── App.jsx                 — Root component + routing
│   └── main.jsx                — Entry point
├── supabase-schema.sql         — Run this in Supabase SQL Editor
├── .env.example                — Copy to .env.local and fill in
├── package.json
├── vite.config.js
└── index.html
```

---

## Support

Any issues or additions — bring them to Claude and we'll build them in.
