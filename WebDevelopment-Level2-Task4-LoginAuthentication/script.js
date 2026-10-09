const USERS_KEY = "secureaccess_users_v1";
const SESSION_KEY = "secureaccess_session_v1";

const page = document.body.dataset.page;

// Display success or error messages.
function showMessage(element, text, type = "error") {
    if (!element) return;

    element.textContent = text;
    element.style.color =
        type === "success" ? "#15803d" : "#dc2626";
}

// Check whether browser-based hashing is available.
function hashingAvailable() {
    return Boolean(
        window.isSecureContext &&
        window.crypto &&
        window.crypto.subtle
    );
}

// Read registered accounts from localStorage.
function loadUsers() {
    const stored = localStorage.getItem(USERS_KEY);

    if (!stored) return [];

    const users = JSON.parse(stored);

    if (!Array.isArray(users)) {
        throw new Error("Stored account data is invalid.");
    }

    return users;
}

// Store registered accounts.
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Create a random salt for a new password.
function createSalt() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

// Hash the password using SHA-256 and its salt.
async function hashPassword(password, salt) {
    const input = `${salt}:${password}`;
    const encoded = new TextEncoder().encode(input);

    const result = await crypto.subtle.digest("SHA-256", encoded);

    return Array.from(new Uint8Array(result))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

// -------------------- LOGIN PAGE --------------------

if (page === "login") {
    const form = document.getElementById("loginForm");
    const identifierInput = document.getElementById("loginIdentifier");
    const passwordInput = document.getElementById("loginPassword");
    const message = document.getElementById("loginMessage");

    const params = new URLSearchParams(window.location.search);

    if (params.get("registered") === "1") {
        showMessage(
            message,
            "Account created successfully. Please log in.",
            "success"
        );
    } else if (params.get("loggedout") === "1") {
        showMessage(message, "You have logged out successfully.", "success");
    } else if (params.get("reason") === "session") {
        showMessage(message, "Please log in to access the dashboard.");
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        showMessage(message, "");

        const identifier = identifierInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        if (!identifier || !password) {
            showMessage(message, "Enter your username/email and password.");
            return;
        }

        if (!hashingAvailable()) {
            showMessage(
                message,
                "Secure browser features are unavailable. Open this site using localhost or HTTPS."
            );
            return;
        }

        try {
            const users = loadUsers();

            const user = users.find(account =>
                account.usernameKey === identifier ||
                account.emailKey === identifier
            );

            // Use the same error for all invalid credentials.
            if (!user || !user.salt || !user.passwordHash) {
                showMessage(message, "Invalid username/email or password.");
                return;
            }

            const enteredHash = await hashPassword(password, user.salt);

            if (enteredHash !== user.passwordHash) {
                showMessage(message, "Invalid username/email or password.");
                return;
            }

            // This is a demonstration session, not a secure server session.
            sessionStorage.setItem(SESSION_KEY, user.emailKey);

            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("Login error:", error);
            showMessage(
                message,
                "Unable to log in. Check browser storage and try again."
            );
        }
    });
}

// -------------------- REGISTRATION PAGE --------------------

if (page === "register") {
    const form = document.getElementById("registerForm");
    const usernameInput = document.getElementById("registerUsername");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const confirmInput = document.getElementById("confirmPassword");
    const message = document.getElementById("registerMessage");

    form.addEventListener("submit", async event => {
        event.preventDefault();
        showMessage(message, "");

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmation = confirmInput.value;

        if (!username || !email || !password || !confirmation) {
            showMessage(message, "Please complete all fields.");
            return;
        }

        if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
            showMessage(
                message,
                "Username must be 3–30 characters and use only letters, numbers, dots, underscores or hyphens."
            );
            return;
        }

        if (!emailInput.validity.valid) {
            showMessage(message, "Enter a valid email address.");
            return;
        }

        if (password.length < 8 || !/\d/.test(password)) {
            showMessage(
                message,
                "Password must contain at least 8 characters and one number."
            );
            return;
        }

        if (password !== confirmation) {
            showMessage(message, "The passwords do not match.");
            return;
        }

        if (!hashingAvailable()) {
            showMessage(
                message,
                "Browser hashing is unavailable. Open this site using localhost or HTTPS."
            );
            return;
        }

        try {
            const users = loadUsers();

            const usernameKey = username.toLowerCase();
            const emailKey = email;

            const duplicate = users.some(account =>
                account.usernameKey === usernameKey ||
                account.emailKey === emailKey
            );

            if (duplicate) {
                showMessage(
                    message,
                    "That username or email is already registered."
                );
                return;
            }

            const salt = createSalt();
            const passwordHash = await hashPassword(password, salt);

            // Plain-text passwords are never saved.
            users.push({
                username,
                usernameKey,
                email,
                emailKey,
                salt,
                passwordHash,
                createdAt: new Date().toISOString()
            });

            saveUsers(users);

            window.location.href = "index.html?registered=1";
        } catch (error) {
            console.error("Registration error:", error);
            showMessage(
                message,
                "Unable to create your account. Check browser storage and try again."
            );
        }
    });
}

// -------------------- PROTECTED DASHBOARD --------------------

if (page === "dashboard") {
    const welcomeUsername = document.getElementById("welcomeUsername");
    const profileUsername = document.getElementById("profileUsername");
    const profileEmail = document.getElementById("profileEmail");
    const logoutButton = document.getElementById("logoutButton");

    try {
        const sessionEmail = sessionStorage.getItem(SESSION_KEY);

        if (!sessionEmail) {
            window.location.replace("index.html?reason=session");
        } else {
            const users = loadUsers();

            const currentUser = users.find(
                account => account.emailKey === sessionEmail
            );

            if (!currentUser) {
                sessionStorage.removeItem(SESSION_KEY);
                window.location.replace("index.html?reason=session");
            } else {
                welcomeUsername.textContent = currentUser.username;
                profileUsername.textContent = currentUser.username;
                profileEmail.textContent = currentUser.email;
            }
        }
    } catch (error) {
        console.error("Dashboard error:", error);
        sessionStorage.removeItem(SESSION_KEY);
        window.location.replace("index.html?reason=session");
    }

    logoutButton.addEventListener("click", () => {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = "index.html?loggedout=1";
    });
}