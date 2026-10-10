# Niue News - Implementation Plan & Roadmap

This document serves as the roadmap for the Niue News web application. It outlines the original vision, what has already been accomplished, and the remaining features to be implemented based on the original project prompt.

## ✅ Phase 1: Foundation & Core Features (Completed)

- **Branding & UI:** Modern online news design utilizing Navy (`#002B7F`), Red (`#CE1126`), White (`#FFFFFF`), and Yellow Gold (`#FCD116`).
- **User Roles & Auth:** Secure login via Google Authentication with Role-Based Access Control (Super Admin, Admin, Moderator, Standard).
- **Article Submission:** A submission portal for writers, storytellers, and creators.
- **Categorization:** Implemented the 8 specified news categories (Community, Health, Education, Politics, Sports, Entertainment, Technology, Regional & Global).
- **Moderation Workflow:** All submissions go to a "Pending" queue where Moderators/Admins can review, publish, schedule for future publishing, un-publish, or reject them.
- **Drafts Management:** Writers can view, edit, and re-submit rejected articles via the "My Drafts" portal.
- **Media Support:** Direct-to-Firestore Base64 client-side compressed image uploads with preview and credits.
- **Reading Experience:** 
  - Truncated article cards on the homepage (maximum 3 paragraphs).
  - Full articles protected by anti-copy mechanisms (disabling right-click and selection).
- **Engagement:** Readers can leave 100-word reviews with star ratings and emojis.
- **AI Integration:** URL Analyzer tool exclusive to Admins/Super Admins powered by Google Gemini.

## 🚧 Phase 2: Publishing Enhancements (Next Steps)

### 1. Scheduled Publishing (Completed)
**Goal:** Allow Moderators and Admins to approve an article but set it to automatically publish at a specific future date and time.
- **Tasks:**
  - ✅ Update the Firestore `articles` schema to support `scheduledPublishDate`.
  - ✅ Update the Moderation UI to include a Date/Time picker when approving an article.
  - ✅ Implement a backend cron job API route to automatically transition articles from `scheduled` to `published` status when the time is reached.

### 2. Social Media Auto-Push
**Goal:** Automatically push the first three paragraphs of an article, along with a link, to selected social media accounts when the article goes live.
- **Tasks:**
  - 📝 **Target Platform:** Facebook Page.
  - 📝 **Credentials Needed:** Facebook Developer App, Page ID, and a never-expiring Page Access Token.
  - 📝 **Architecture:** 
    1. Create a secure backend API route (`/api/social/facebook`) that takes a published article, extracts the first three paragraphs, formats a link to the site, and sends it to the Facebook Graph API.
    2. Trigger this API automatically when a moderator clicks "Approve & Publish Now" and from the backend cron job when a scheduled article goes live.
  - 🚧 **Current Step:** Implementing a standard manual "Share to Facebook" button for moderators to test the sharing functionality before fully automating the API triggers.

## 📅 Phase 3: Monetization (Future Implementation)

### 1. e-Commerce Payment & Subscriptions
**Goal:** Implement a paywall or subscription model to monetize premium content or restrict access to full articles.
- **Tasks:**
  - Select a payment gateway (e.g., Stripe, PayPal).
  - Integrate payment gateway for one-time purchases or recurring subscription plans.
  - Update Firestore security rules to restrict full article reads to active subscribers.
  - Build UI for a "Subscribe to read the full article" paywall.
  - Create a user dashboard section for managing active subscriptions and billing.
