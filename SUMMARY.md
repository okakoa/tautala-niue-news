# Niue News - Project Summary

A global community news web app for the island nation of Niue, featuring a robust moderation system, AI-assisted content generation, and role-based access control.

## Features

- **Authentication & Roles:** Secure login via Google Authentication. Strict RBAC restricting dashboard features to Standard users, Moderators, Admins, and Super Admins.
- **Article Moderation Queue:** Writers submit drafts which drop into a "Pending" queue. Moderators can read, publish, un-publish, or reject stories.
- **Public Feed & Reading Experience:** The homepage displays beautiful, truncated article cards (maximum 3 paragraphs). Clicking through reveals the full article protected by anti-copy mechanisms (disabling right-click and selection).
- **Reviews & Ratings:** Readers can leave 100-word reviews with star ratings and thumbs-up/down emojis on full articles.
- **AI URL Analyzer:** Exclusive to Admins and Super Admins, a Gemini-powered tool that analyzes a URL and generates Niuean community impact steps.
- **Global Branding & Analytics:** Custom logos, global clickable watermarks, and integrated Google Analytics tracking.
- **Deployment:** Fully compatible with Firebase App Hosting.

## Tech Stack
- **Frontend:** Next.js 16 App Router, React, TypeScript, Vanilla CSS.
- **Backend:** Firebase Authentication, Firestore Database, Firebase Admin SDK.
- **AI:** Google Gemini API.

## Getting Started

1. Create a `.env.local` file populated with your Firebase and Gemini credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
