# What Happens When User Clicks "Send Message"

## Step-by-Step Process

### 1. **User Interface (Frontend)**
```
User fills the form with:
├─ Name: "John Doe"
├─ Email: "john@example.com"
├─ Subject: "Help needed"
└─ Message: "I would like to volunteer..."

User clicks "Send Message" button
```

### 2. **JavaScript Execution (script.js)**
```javascript
// Form submission event listener detects the click
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevents page reload
    
    // Gathers all form data
    const formData = new FormData(this);
    
    // Changes button state to "Sending..."
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    // Sends data to Node.js backend via AJAX
    fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: this.querySelector('#name').value,
            email: this.querySelector('#email').value,
            subject: this.querySelector('#subject').value,
            message: this.querySelector('#message').value
        })
    })
```

**What the user sees:**
- ✓ Button changes to "Sending..." (disabled)
- ✓ No page reload
- ✓ Form remains visible

### 3. **Node.js Processing (`/api/contact`)**

**Receives JSON and performs:**

```js
// 1. Parse request body (Express + bodyParser)
const { name, email, subject, message } = req.body;

// 2. Validate required fields
if (!name || !email || !message) {
  return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
}

// 3. Use prepared statements with mysql2 to insert safely
const sql = 'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)';
await conn.execute(sql, [name, email, subject || '', message]);

// 4. Return JSON success
res.json({ success: true, message: 'Thank you for your message! We will get back to you soon.' });
```

### 4. **Database Storage (MySQL)**

**Data inserted into contact_messages table:**

| id | name | email | subject | message | created_at |
|---|---|---|---|---|---|
| 1 | John Doe | john@example.com | Help needed | I would like to volunteer... | 2026-01-30 12:45:23 |

### 5. **Response Back to JavaScript**

```json
{
    "success": true,
    "message": "Thank you for your message! We will get back to you soon."
}
```

### 6. **User Feedback**

```javascript
.then(data => {
    if (data.success) {
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        
        // Clear form fields
        this.reset();
    } else {
        // Show error message
        alert('Error: ' + data.message);
    }
})
.finally(() => {
    // Restore button to normal state
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
});
```

**What the user sees:**
- ✓ Alert message: "Thank you for your message..."
- ✓ Form fields cleared (empty again)
- ✓ Button returns to "Send Message"
- ✓ Ready to submit another message

---

## Complete Timeline

```
T+0ms:    User clicks "Send Message" button
T+10ms:   JavaScript prevents page reload
T+20ms:   Gathers form data
T+30ms:   Changes button to "Sending..." state
T+40ms:   Sends AJAX request to submit_contact.php
T+100ms:  PHP receives request
T+110ms:  Validates form data
T+120ms:  Sanitizes input for security
T+130ms:  Connects to database
T+140ms:  Inserts data into contact_messages table
T+150ms:  Returns JSON response
T+160ms:  JavaScript receives response
T+170ms:  Shows success alert
T+180ms:  Clears form fields
T+190ms:  Restores button to normal state
T+200ms:  Process complete ✓
```

---

## Language Support

### If user has English selected:
- Button shows: "Send Message"
- Success message: "Thank you for your message! We will get back to you soon."
- Error prefix: "Error:"
- Loading text: "Sending..."

### If user has Tamil selected:
- Button shows: "செய்தியை அனுப்பு"
- Success message: "உங்கள் செய்திக்கு நன்றி! விரைவில் உங்களுக்கு பதிலளிப்போம்."
- Error prefix: "பிழை:"
- Loading text: "அனுப்பு..."

---

## Data Validation

### Required Fields:
- ✓ name (must not be empty)
- ✓ email (must be valid email format)
- ✓ message (must not be empty)

### Optional Fields:
- ○ subject (can be empty)

### Errors Caught:
- ✓ Empty required fields → "Please fill in all required fields"
- ✓ Invalid email format → "Invalid email format"
- ✓ Database connection failure → "Connection failed"
- ✓ SQL execution error → "Error: [error message]"

---

## Security Measures

1. **SQL Injection Prevention**
   - Uses prepared statements with parameterized queries
   - Input never directly inserted into SQL

2. **Email Validation**
   - Checks email format before storage
   - Prevents invalid email records

3. **Input Sanitization**
   - Trims whitespace
   - Validates required fields

4. **Error Handling**
   - Never exposes database details
   - Returns safe JSON responses

5. **HTTPS Ready**
   - Works with SSL certificates
   - Secure data transmission

---

## Database Record Example

Once data is in the database, you can:

1. **View in PhpMyAdmin** - See all submissions
2. **Export to CSV** - For reports/analysis
3. **Query by date** - See messages from specific period
4. **Search by email** - Find messages from specific contact
5. **Count statistics** - Total messages, unique visitors, etc.

---

**Last Updated:** January 30, 2026
**Website:** Vaagai Foundation Contact Form Integration
