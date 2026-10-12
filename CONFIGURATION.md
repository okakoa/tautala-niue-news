# Project Configuration

## Project Details
- **Name:** Niue News (formerly Tautala Niue News)
- **Description:** A global community news web app for the island nation of Niue. Writers submit stories to be moderated and published.
- **Target Audience:** Creators, Writers, and the Niuean Global Community.
- **Branding:** 
  - Navy (`#002B7F` / `#001f5c`), Red (`#CE1126`), White (`#FFFFFF`), Yellow Gold (`#FCD116`).
  - Custom globe logo, favicon (`/icon.jpg`), and global bottom-right fixed watermark (`/watermark.png`) linking to Oka Apps.
  - Watermark behavior: 120px on desktop; auto-scaled to 75px on mobile devices with `pointer-events: none` to prevent blocking touch taps or scrolling.

## Technology Stack
- **Framework:** Next.js 16 (App Router with Turbopack)
- **Language:** TypeScript
- **Styling:** Vanilla CSS (`globals.css`) with responsive design tokens and mobile-first media queries.
- **Authentication & Database:** Firebase (Auth, Firestore)
- **Deployment:** Firebase App Hosting (Gen 2)
- **AI Integration:** Google Gemini API (`@google/generative-ai` SDK)
- **Analytics:** Google Analytics via Firebase

## Environment Variables
- `GEMINI_API_KEY`: Required for generating AI impact steps and article drafts.
- `NEXT_PUBLIC_FIREBASE_*`: Standard Firebase client keys (API Key, Project ID, App ID, etc.).
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: Google Analytics tracking ID.
- `NEXT_PUBLIC_SITE_URL`: Production Host App URL (e.g. `https://tautala-niue-news--gen-lang-client-0117058947.us-east4.hosted.app`).
- `FIREBASE_CLIENT_EMAIL` & `FIREBASE_PRIVATE_KEY`: Firebase Admin Service Account credentials.
- `CRON_SECRET`: Optional bearer token for securing scheduled publishing cron endpoints (`/api/cron/publish-scheduled`).
- `FACEBOOK_PAGE_ID` & `FACEBOOK_PAGE_ACCESS_TOKEN`: Facebook Graph API credentials for auto-publishing articles to the "News Niue" page.

## Role-Based Access Control (RBAC)
- **Super Admin:** Can manage app settings, user roles, moderation queue, and use URL Analyzer.
- **Admin:** Can manage user roles, moderation queue, and use URL Analyzer.
- **Moderator:** Can review pending articles, edit story text, publish immediately, schedule future publishing, un-publish, or return stories as drafts.
- **Standard User:** Can view published articles, read full articles, leave reviews, submit new stories for review, and edit/resubmit their own drafts.

## Dashboard & Navigation Architecture
- **Real-Time Article Badges:** Live Firestore listener (`onSnapshot`) tracking articles authored by the logged-in user account:
  - `My Drafts`: Status badge counting user's drafts.
  - `Pending Articles`: Status badge counting user's pending articles.
  - `Published Articles`: Status badge counting user's published articles.
  - `Un-Published Articles`: Status badge counting user's unpublished articles.
- **Responsive Layout:** Collapsible sidebar on mobile devices with touch-friendly tap targets and active route highlighting.

## Content Protection & Mobile Experience
- **Intellectual Property Protection:** Anti-highlighting (`userSelect: none`), disabled right-click context menu, and blocked cut/copy/drag handlers across public articles.
- **Mobile Readability UX:** Compact above-the-fold hero, horizontally scrollable category chips, fluid typography (`clamp` font sizes, 1.8 line-height), and full-width thumb-friendly CTAs.

