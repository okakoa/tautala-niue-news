# Project Configuration

## Project Details
- **Name:** Niue News (formerly Tautala Niue News)
- **Description:** A global community news web app for the island nation of Niue. Writers submit stories to be moderated and published. 
- **Target Audience:** Creators, Writers, Niuean Global Community.
- **Branding:** Navy (`#002B7F`), Red (`#CE1126`), White (`#FFFFFF`), Yellow Gold (`#FCD116`). Features custom logo, favicon, and global bottom-right watermark.

## Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Vanilla CSS (`globals.css`)
- **Authentication & Database:** Firebase (Auth, Firestore)
- **Deployment:** Firebase App Hosting (Gen 2)
- **AI Integration:** Google Gemini API (`@google/generative-ai` SDK)
- **Analytics:** Google Analytics via Firebase

## Environment Variables
- `GEMINI_API_KEY`: Required for generating AI impact steps and article drafts.
- `NEXT_PUBLIC_FIREBASE_*`: Standard Firebase client keys.
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: Google Analytics tracking ID.
- `FIREBASE_CLIENT_EMAIL` & `FIREBASE_PRIVATE_KEY`: Firebase Admin Service Account credentials.

## Role-Based Access Control (RBAC)
- **Super Admin:** Can manage app settings, users, and use URL Analyzer.
- **Admin:** Can manage users and use URL Analyzer.
- **Moderator:** Can review pending articles, publish, draft, or reject.
- **Standard:** Can view published articles, read full articles, leave reviews, and submit new stories.
