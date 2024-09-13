# Roblox Model Uploader 🚀

This project is a **Roblox Model Uploader** that automates the process of uploading models to Roblox. Using **noblox.js**, it handles user authentication with cookies and provides a simple command-line interface (CLI) for managing accounts, checking cookie validity, and uploading models.

## Features 🌟

1. **🔄 Cookie Refresher**: Automatically refresh stored cookies to maintain session activity.
2. **✅ Cookie Checker**: Verify saved cookies and sort them into working and non-working categories.
3. **📦 Model Uploader**: Upload multiple `.rbxm` models using several accounts, enabling fast and automated uploads.

## How It Works ⚙️

- **Cookies** are stored in a `cookies.txt` file inside the `cookies` directory. The script reads these cookies to log into Roblox accounts.
- **Models** are placed in the `models` directory, and the uploader selects one randomly for each session.
- Errors and logs are saved to `errors.txt`, making it easy to troubleshoot issues.

### Prerequisites 🛠️

- Node.js
- Noblox.js (`npm install noblox.js`)
- Additional dependencies: `prompt-sync`, `fs`, and `path` for file management and user input.

## Running the Project 💻

You can run the script either by using **Node.js** or a convenient **run.bat** file:

### Option 1: Using Node.js

```bash
node index.js
```

### Option 2: Using `run.bat` (Windows)

Just double-click the `run.bat` file to launch the script without needing to use the command line.

## Menu Options 🗂️

- **1️⃣ Cookie Refresher**: Refresh and update your stored cookies.
- **2️⃣ Cookie Checker**: Check which cookies are still valid.
- **3️⃣ Upload Model**: Automatically upload `.rbxm` models using one or more Roblox accounts.
- **0️⃣ Exit**: Safely exit the program.
