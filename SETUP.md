# Environment Setup Guide

## Fix for 500 Internal Server Error

The error you're experiencing is due to missing Google Gemini API configuration.

### Step 1: Get Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Create Environment File

Create a file named `.env.local` in your project root with the following content:

```
GEMINI_API_KEY=your_actual_api_key_here
GOOGLE_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you copied from Google AI Studio.

### Step 3: Restart Development Server

After creating the `.env.local` file:

1. Stop your development server (Ctrl+C)
2. Run `npm run dev` again
3. The interview question generation should now work

### Alternative: Set Environment Variables Directly

If you prefer not to use a `.env.local` file, you can set the environment variables directly in your terminal:

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="your_actual_api_key_here"
$env:GOOGLE_API_KEY="your_actual_api_key_here"
npm run dev
```

**Windows (Command Prompt):**
```cmd
set GEMINI_API_KEY=your_actual_api_key_here
set GOOGLE_API_KEY=your_actual_api_key_here
npm run dev
```

### Verification

After setting up the API key, the interview question generation should work without the 500 error.
