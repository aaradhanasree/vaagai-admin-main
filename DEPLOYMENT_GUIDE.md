# Vaagai Foundation - Deployment Guide

## Project Overview
- **Frontend:** Static HTML/CSS/JS (index.html, styles.css, script.js)
- **Backend:** Node.js Express server (server.js) with MySQL database integration
- **Database:** Hostinger MySQL (u146057062_DBvaagai)

## Pre-Deployment Checklist

✅ All static files present: `index.html`, `styles.css`, `script.js`
✅ Node.js backend: `server.js` (connects to `/api/contact` endpoint)
✅ Dependencies configured: `package.json`
✅ Environment variables: `.env` (stored securely)
✅ Database schema: `database_schema.sql` (ready to import)
✅ Git-safe: `.gitignore` prevents `.env` from being committed

---

## Deployment Steps

### 1. **Push Code to GitHub (Optional)**
```bash
cd d:\Support\2026\Inspire\Vaagai\vaagai-org-main
git init
git add .
git commit -m "Initial Vaagai Foundation deployment"
git remote add origin https://github.com/yourusername/vaagai-foundation.git
git push -u origin main
```

### 2. **Upload to Hostinger**

#### Option A: File Manager (Recommended for Static Files)
1. Log in to Hostinger → File Manager
2. Upload to `public_html/`:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `img/` folder
   - All other static files

#### Option B: Git Deploy (If Hostinger supports it)
1. Connect your GitHub repo to Hostinger
2. Auto-deploy on push

#### Option C: FTP/SFTP
Use FileZilla or similar to upload all files.

---

### 3. **Set Up Node.js Server on Hostinger**

1. **Access Hostinger Control Panel**
   - Go to "Node.js" or "Application Manager"
   - Create a new Node.js application

2. **Deploy Backend Files**
   - Upload `server.js`
   - Upload `package.json`
   - Upload `.env.example` (as reference, then create `.env` manually in their panel)

3. **Install Dependencies**
   ```bash
   npm install
   ```
   Or in Hostinger: Click "Install Dependencies" button

4. **Set Environment Variables** (Hostinger Control Panel)
   ```
   DB_HOST=localhost
   DB_USER=u146057062_adminvaagai
   DB_PASS=your_password_here
   DB_NAME=u146057062_DBvaagai
   PORT=3000
   ```

---

### 4. **Database Setup**

1. **Create Table in Hostinger phpMyAdmin**
   - Log in: https://auth-db2201.hstgr.io/
   - Select database: `u146057062_DBvaagai`
   - Import `database_schema.sql` (or run the CREATE TABLE script)

2. **Verify Connection**
   - Visit: `https://yourdomain.com/api/test_connection`
   - Should return: `{"success": true, "message": "Connected to database"}`

---

### 5. **Test Contact Form**

1. Open: `https://yourdomain.com/index.html`
2. Fill out the contact form
3. Click "Send Message"
4. Check Hostinger phpMyAdmin → `contact_messages` table for the saved entry

---

## Troubleshooting

### 500 Error on `/api/contact`
- Check `.env` credentials (DB_USER, DB_PASS, DB_NAME, DB_HOST)
- Verify database table exists
- Check Hostinger logs for MySQL errors

### Database Connection Failed
- Ensure `localhost` is correct (it is for Hostinger)
- Confirm credentials in `.env` match Hostinger panel
- Verify table `contact_messages` exists

### Form Not Submitting
- Open browser DevTools → Network tab
- Check response from `/api/contact` for error details
- Ensure `server.js` is running (check Hostinger Application Manager)

---

## File Structure for Deployment

```
public_html/
├── index.html              # Main website
├── styles.css              # Styling
├── script.js               # Frontend logic
├── img/                    # Images folder
├── server.js               # Node.js backend (if deploying Node.js app)
├── package.json            # Dependencies
├── .env                    # Environment variables (created manually, not committed)
├── .env.example            # Template for .env
└── database_schema.sql     # Database setup script
```

---

## Quick Deployment Checklist

- [ ] Database created: `u146057062_DBvaagai`
- [ ] Table imported: `contact_messages`
- [ ] Environment variables set in Hostinger panel
- [ ] Node.js application started
- [ ] Static files uploaded to `public_html/`
- [ ] Domain points to correct folder
- [ ] Test form submission works
- [ ] Messages appear in database

---

## Support

For questions:
- Hostinger Docs: https://support.hostinger.com
- Node.js in Hostinger: https://www.hostinger.com/tutorials/nodejs-hosting
- MySQL phpMyAdmin: https://auth-db2201.hstgr.io/

---

**Last Updated:** February 9, 2026
