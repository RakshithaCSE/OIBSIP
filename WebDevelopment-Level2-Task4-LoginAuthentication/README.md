# SecureAccess — Login Authentication System

## Project Description

SecureAccess is a browser-based authentication system developed using HTML5, CSS3, and JavaScript. It demonstrates user registration, login validation, duplicate-account detection, password hashing, protected dashboard access, and logout functionality.

## Features

* User registration with username, email, and password
* Password validation requiring at least 8 characters and one number
* Duplicate username and email detection
* Login using username or email
* Generic error message for incorrect credentials
* Password hashing using SHA-256 with a unique salt
* Protected dashboard accessible after successful login
* Session management using sessionStorage
* Logout functionality that clears the session
* Form validation for empty and invalid inputs
* Responsive interface for desktop and mobile devices

## Technologies Used

* HTML5
* CSS3
* JavaScript
* Web Crypto API
* localStorage
* sessionStorage

## Project Structure

```text
WebDev-L2-LoginAuthentication/
├── index.html
├── register.html
├── dashboard.html
├── style.css
├── script.js
└── README.md
```

## How to Run

1. Open the project folder in Visual Studio Code.

2. Open the terminal in that folder.

3. Start the local server:

   `python -m http.server 8003`

4. Open `http://localhost:8003` in your browser.

5. Create a test account, log in, open the dashboard, and test logout.

Use localhost or HTTPS so the browser's Web Crypto API is available.

## Security Note

This project is intended for educational demonstration. Authentication data is stored in the browser, so users can bypass or modify client-side checks. SHA-256 alone is not a suitable production password-storage method, even when salted. Real applications should use server-side authentication, secure sessions, and a password-hashing algorithm designed for passwords.

Do not use real passwords or sensitive personal information when testing this demonstration.

## Internship

**OASIS INFOBYTE — Web Development & Designing Internship**

**Level 2 — Task 4: Login Authentication System**

## Author

Rakshitha M V
Computer Science Engineering Student
Don Bosco Institute of Technology, Bengaluru
