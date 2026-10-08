# Project Configuration

## Project Details
- **Name:** Tautala Niue News
- **Description:** A global community news web app for the island nation of Niue. Writers submit stories to be moderated and published. 
- **Target Audience:** Creators, Writers, Niuean Global Community.
- **Colors:** Navy (`#002B7F`), Red (`#CE1126`), White (`#FFFFFF`), Yellow Gold (`#FCD116`).

## Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Vanilla CSS (`globals.css`)
- **Package Manager:** npm
- **AI Integration:** Google Gemini API (`@google/generative-ai` SDK)

## Environment Variables
- `GEMINI_API_KEY`: Required for generating AI impact steps and article drafts. (Model: `gemini-flash-lite-latest`)

## Project Structure
- `/src/app/page.tsx`: Main user interface and Content Idea Generator form.
- `/src/app/layout.tsx`: Root layout featuring the main navigation bar.
- `/src/app/globals.css`: Global design system and color tokens.
- `/src/app/api/analyze/route.ts`: Server-side API route for securely calling the Gemini AI.
