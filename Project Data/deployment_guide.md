# BLS School LMS - Deployment Guide

Aapka system ab "Live" hone ke liye bilkul tayyar hai. Chunke Database pehle hi Supabase (Cloud) par shift ho chuka hai, ab aapko sirf Backend aur Frontend ko online host karna hai.

## Step 1: Backend Deployment (API)
Backend ko host karne ke liye **Render** (render.com) sab se behtareen aur muft option hai.

1. **GitHub par Code Upload Karein:** Sab se pehle apna poora project GitHub par upload karein.
2. **Render par New Web Service Banayein:**
   - Render.com par account banayein aur apna GitHub repository connect karein.
   - **Root Directory:** `backend` select karein.
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start` (Yad rahe ke [package.json](file:///e:/blsschool-main%20-%20Copy/package.json) mein `start` script `node dist/index.js` honi chahiye).
3. **Environment Variables (Render Dashboard):**
   - Click "Environment" and add:
     - `DATABASE_URL`: (Aapka Supabase pooler link jo [.env](file:///e:/blsschool-main%20-%20Copy/.env) mein hai).
     - `PORT`: `3001`
     - `JWT_SECRET`: (Koi bhi lamba random string).
4. **Deploy:** Render aapka backend live kar de ga (e.g., `https://bls-api.onrender.com`).

---

## Step 2: Frontend Deployment (Website)
Frontend ke liye **Vercel** (vercel.com) sab se best hai.

1. **Vercel par New Project Banayein:**
   - Vercel.com par jayen aur wahi GitHub repository select karein.
   - **Framework Preset:** Vite.
   - **Root Directory:** (Isko khaali rehne dain ya `./` select karein).
   - **Build Command:** `npm run build`
2. **Environment Variables (Vercel Dashboard):**
   - Click "Settings" -> "Environment Variables" and add:
     - `VITE_API_URL`: (Aapke live backend ka URL, e.g., `https://bls-api.onrender.com`).
3. **Deploy:** Vercel aapki website ko live kar de ga (e.g., `https://bls-school.vercel.app`).

---

## Step 3: Final Check
Jab dono cheezein deploy ho jayen:
1. Apni website open karein.
2. Login page par jayen.
3. Agar woh backend se data fetch kar rahi hai, toh iska matlab aap live hain!

**Note:** Agar aap apna personal domain (e.g., `www.blsschool.edu.pk`) lagana chahte hain, toh Vercel ke settings mein "Domains" section mein ja kar apna domain add kar sakte hain.
