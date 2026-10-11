# Niue News - Project Summary

A global community news web application for the island nation of Niue, featuring a robust editorial moderation system, AI-assisted content tools, role-based access control, and a comfortable, mobile-first reading experience.

---

## Key Features & Capabilities

### 1. Editorial Workflow & Moderation Queue
- **Submission & Moderation Queue:** Writers submit news stories that automatically enter the "Pending" review queue.
- **In-Place Story Editing:** Moderators can edit article headlines, categories, and content directly before publishing.
- **Article Preview Modal:** Real-time "Preview Article" functionality available across Submission (`/submit`), Drafts (`/dashboard/drafts`), and Pending review (`/dashboard/pending`) views.
- **Publishing & Scheduling:** Moderators can publish articles immediately or schedule automatic publication for a specific date and time.
- **Drafts Management:** Writers can view, edit, preview, and re-submit returned drafts from their dedicated "My Drafts" interface.

### 2. Real-Time Dashboard & User Counters
- **Live Account Article Badges:** Live Firestore listeners (`onSnapshot`) track articles authored by the currently logged-in account:
  - **My Drafts:** Gray pill badge displaying current draft count.
  - **Pending Articles:** Blue pill badge displaying submitted stories awaiting review.
  - **Published Articles:** Green pill badge displaying approved public stories.
  - **Un-Published Articles:** Amber pill badge displaying archived or pulled stories.
- **Route Highlighting & Navigation:** Active dashboard tab indicators and responsive collapsible sidebar layout for desktop and mobile screens.

### 3. Mobile-First Reading Experience & UI/UX
- **Compact Mobile Hero:** Optimized headline scale and padding ensuring news stories are visible above the fold on phones.
- **Interactive Category Chips Bar:** Horizontally scrollable chip bar with touch inertia (BBC/Apple News feel) that filters stories in real-time (Community, Health, Education, Politics, Sports, Entertainment, Technology, Regional & Global).
- **Mobile Navbar Drawer:** Sticky responsive navbar with animated slide-down hamburger drawer and thumb-friendly touch targets.
- **Editorial Typography:** Designed for eye comfort with 17px base body size, `#1e293b` warm dark-gray contrast, 1.8 line-height, and full-width touch CTAs.
- **Adaptive Watermark:** 120px desktop branding with automatic 75px mobile scaling and `pointer-events: none` to never obstruct touch taps or reading.

### 4. Content Protection & Reader Engagement
- **Intellectual Property Protection:** Comprehensive anti-copy mechanism disabling text selection (`userSelect: none`), context menu right-clicks, and copy/cut/drag events on public articles.
- **Reader Reviews & Ratings:** Authenticated readers can rate articles (1-5 stars), recommend via thumbs up/down, and write concise reviews (max 100 words).
- **Social Media Integration:** Manual Facebook Share button on published articles, with architecture ready for automatic Facebook Graph API posting.

### 5. Media & AI Tools
- **Auto-Compressed Images:** Client-side image compression (max 500KB) converting uploads into Base64 strings to bypass Firebase Storage CORS restrictions.
- **AI URL Analyzer:** Gemini-powered tool (accessible to Admins and Super Admins) that analyzes web links and extracts actionable community impact steps for Niue.

---

## Tech Stack
- **Frontend:** Next.js 16 (App Router with Turbopack), React 19, TypeScript, Vanilla CSS.
- **Backend & Auth:** Firebase Authentication, Cloud Firestore, Firebase Admin SDK.
- **AI SDK:** Google Gemini API (`@google/generative-ai`).
- **Hosting:** Firebase App Hosting (Gen 2).

---

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
4. Open [http://localhost:3000](http://localhost:3000) with your browser to explore the platform.

