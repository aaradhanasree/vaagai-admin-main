# Database Setup Guide - Vaagai Foundation Contact Form

## Step 1: Create Database & Table in Hostinger

1. **Log in to Hostinger Control Panel**
   - Go to your Hostinger account
   - Navigate to **Databases** or **MySQL Databases**

2. **Create New Database**
   - Click "Create New Database"
   - Database Name: `vaagai_foundation` (or any name you prefer)
   - Note the database name, username, and password

3. **Create Table**
   - Go to **PhpMyAdmin** or database management tool
   - Select your new database
   - Click **SQL** tab and paste this:

```sql
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    subject VARCHAR(200),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- Click **Execute**

---

## Step 2: Update Configuration File

1. **Open `config.php`** in your project folder
2. **Replace these values** with your Hostinger credentials:

```php
$servername = "localhost";  // Usually localhost for Hostinger
$username = "your_db_username";  // Your database username
$password = "your_db_password";  // Your database password
$dbname = "vaagai_foundation";   // Your database name
```

**Example:**
```php
$servername = "localhost";
$username = "u123456789_vaagai";
$password = "YourPassword123!";
$dbname = "u123456789_vaagai";
```

---

## Step 3: Upload Files to Hostinger

1. **Use FTP or File Manager** in Hostinger control panel
2. **Upload these files** to your public_html folder:
   - `config.php` (with your credentials)
   - `submit_contact.php` (the form handler)
   - `script.js` (updated JavaScript)
   - All other files (index.html, styles.css, img/, etc.)

---

## Step 4: Test the Form

1. **Open your website** in a browser
2. **Fill out the contact form** with test data
3. **Click "Send Message"**
4. You should see a success message
5. **Check your database** in PhpMyAdmin to verify data was saved

---

## Form Fields

The form collects:
- **name** - Visitor's name
- **email** - Visitor's email address
- **subject** - Message subject (optional)
- **message** - Main message content

All are stored with a **timestamp** for when they were submitted.

---

## Security Notes

✓ **SQL Injection Protection**: Uses prepared statements
✓ **Email Validation**: Validates email format
✓ **Field Validation**: Checks required fields
✓ **JSON Response**: Safe error handling

---

## Troubleshooting

### Error: "Connection failed"
- Check your database credentials in `config.php`
- Verify database exists in Hostinger

### Error: "Prepare failed"
- Check if table `contact_messages` exists
- Run the SQL CREATE TABLE command again

### Form doesn't submit
- Open browser console (F12) to see errors
- Check if `submit_contact.php` file exists on server
- Ensure PHP is enabled on your hosting

### No data in database
- Check database username/password
- Verify the table name matches in config.php

---

## How It Works

1. User fills form and clicks "Send Message"
2. JavaScript gathers form data
3. Sends to `submit_contact.php` via AJAX
4. PHP validates and sanitizes input
5. Data inserted into database
6. Success/error message shown to user
7. Form clears on success

---

**Questions?** Contact your Hostinger support or check the browser console for error messages.
