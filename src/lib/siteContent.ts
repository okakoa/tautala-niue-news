import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export interface SitePageContent {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  updatedAt?: string;
  // Specific fields for contact
  email?: string;
  phone?: string;
  address?: string;
  newsTipsEmail?: string;
  officeHours?: string;
}

export interface SocialLinksContent {
  facebook: string;
  x: string;
  instagram: string;
  youtube: string;
  footerTagline: string;
  aboutSummary: string;
}

export const DEFAULT_PAGES: Record<string, SitePageContent> = {
  about: {
    id: 'about',
    title: 'About Niue News',
    subtitle: 'The trusted independent voice connecting the island of Niue with our global diaspora.',
    content: `Welcome to Niue News, the dedicated independent digital news hub for the island nation of Niue (Nukututaha — The Rock of Polynesia) and our vibrant global diaspora across New Zealand, Australia, and worldwide.

### Our Mission
Our mission is to deliver timely, truthful, and culturally respectful reporting that informs, uplifts, and connects Niueans wherever they call home. From village council decisions, parliamentary updates, environmental conservation, health initiatives, to youth sports and cultural celebrations, we cover the stories that matter most to our community.

### Empowering Community Storytellers
Niue News operates an open-participation community journalism platform. We believe that every Niuean story deserves to be heard. Writers, local creators, and community leaders can submit local stories, event updates, and cultural insights directly through our platform, which are then carefully curated and published by our editorial moderation team.

### Protecting Vagahau Niue & Heritage
Language and culture are the lifeblood of our identity. As Vagahau Niue is classified as an endangered Polynesian language, Niue News actively encourages bilingual storytelling, cultural preservation, and features celebrating our traditions, history, and community elders.

### Editorial Independence & Integrity
We uphold the highest journalistic standards of accuracy, balance, and independence. Our editorial team reviews every submission to ensure factual accuracy and respectful discourse, safeguarding our community from misinformation while maintaining a welcoming forum for constructive conversation.`,
    updatedAt: '2026-10-12T00:00:00.000Z'
  },
  contact: {
    id: 'contact',
    title: 'Contact Niue News',
    subtitle: "We'd love to hear from you. Reach out with news tips, story ideas, or general community inquiries.",
    email: 'contact@niuenews.nu',
    phone: '+683 4000 (Alofi Office)',
    address: 'Commercial Centre, Alofi South, Niue Island',
    newsTipsEmail: 'tips@niuenews.nu',
    officeHours: 'Monday – Friday: 8:00 AM – 4:00 PM (Niue Time, UTC-11)',
    content: `Whether you have a breaking news tip, feedback on an article, or want to partner with us, our editorial and community team is here to listen.

### Editorial & Breaking News Tips
Got a story happening in your village or photos from a local event? Send your news tips directly to our editorial desk. If you have a complete story draft, you can also use our online Submit Story portal after signing in.

### General Enquiries & Community Notices
For press releases, community notices, partnership inquiries, or advertising questions, reach out to our team via email or visit our office in Alofi.`,
    updatedAt: '2026-10-12T00:00:00.000Z'
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'How Niue News collects, protects, and respects your personal data and privacy.',
    content: `*Last Updated: October 2026*

This Privacy Policy explains how Niue News ("we", "us", or "our") collects, uses, and safeguards information when you visit or interact with our website.

### 1. Information We Collect
- **Account Information:** When you sign in using Google Authentication, we collect your name, email address, and profile avatar to personalize your experience and manage permissions.
- **User-Generated Content:** If you submit articles, drafts, or reader reviews, we store the content you provide along with your user ID and submission timestamp.
- **Analytics & Usage Data:** We use Google Analytics via Firebase to collect anonymized data on page views, device types, and browsing patterns to improve platform speed and usability.

### 2. How We Use Your Information
We use your information solely to:
- Publish and attribute news stories and reader reviews you submit.
- Maintain editorial moderation and protect community safety.
- Communicate regarding submissions or administrative updates.
- Improve site performance, mobile accessibility, and user experience.

### 3. Intellectual Property & Content Protection
Niue News protects the original reporting and photography produced by our writers. Our website employs technical mechanisms (including disabling right-click context menus, copy events, and text highlighting) to prevent unauthorized mass scraping and redistribution of content.

### 4. Third-Party Services
We partner with trusted third-party providers including Google Firebase (for authentication, hosting, and database storage) and Meta/Facebook Graph API (for auto-posting approved articles to our official Facebook page). These providers adhere to strict data security standards.

### 5. Cookies & Tracking
We use essential cookies to maintain your login session and anonymous analytical cookies to measure site traffic. You can adjust cookie settings in your browser at any time.

### 6. Your Rights & Data Deletion
You have the right to request access to the personal data we hold about you, request corrections, or request deletion of your account and submitted content. Contact us at privacy@niuenews.nu for any privacy-related requests.`,
    updatedAt: '2026-10-12T00:00:00.000Z'
  },
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    subtitle: 'Please read these terms and conditions carefully before using the Niue News platform.',
    content: `*Last Updated: October 2026*

Welcome to Niue News. By accessing or using our website, you agree to comply with and be bound by the following Terms of Service.

### 1. Acceptance of Terms
By visiting Niue News, submitting stories, or posting reviews, you acknowledge that you have read, understood, and agreed to these Terms and our Privacy Policy. If you do not agree, please do not use the service.

### 2. User Accounts & Responsibilities
- You are responsible for maintaining the confidentiality of your account credentials.
- You agree to provide accurate information when signing in or submitting content.
- Impersonation of any person, community leader, or organization is strictly prohibited.

### 3. Article Submissions & Editorial Moderation
- **Ownership:** Writers retain copyright in their original written contributions. By submitting an article, you grant Niue News a worldwide, non-exclusive, royalty-free license to publish, display, distribute, and promote your article across our website and social channels.
- **Editorial Review:** All submitted stories are subject to review by our moderation team. Niue News reserves the right to edit headlines for clarity, decline publication, or un-publish content that violates community guidelines.
- **Prohibited Content:** Submissions containing hate speech, defamation, harassment, unauthorized personal information, or verified false information will be rejected immediately.

### 4. Intellectual Property & Anti-Copy Protection
- All editorial content, logos, graphics, and website design elements on Niue News are protected under applicable copyright and intellectual property laws.
- **No Unauthorized Scraping or Reproduction:** Automated scraping, mass downloading, framing, or unauthorized re-publication of our articles without prior written permission is strictly prohibited.

### 5. Reader Reviews & Community Conduct
Authenticated readers may submit concise reviews and ratings. Reviews must be respectful, relevant to the article, and not exceed 100 words. We reserve the right to remove inappropriate reviews.

### 6. Disclaimers & Limitation of Liability
Niue News provides information on an "as is" and "as available" basis. While we strive for accuracy, we make no warranties regarding completeness or uninterrupted availability. Niue News shall not be held liable for indirect or consequential damages arising from site use.`,
    updatedAt: '2026-10-12T00:00:00.000Z'
  },
  data_deletion: {
    id: 'data_deletion',
    title: 'Data Deletion Instructions',
    subtitle: 'Step-by-step instructions on how users can request deletion of their account and personal data.',
    content: `*Last Updated: October 2026*

In accordance with Meta/Facebook Platform Rules, Google API User Data Policies, and general data privacy standards, Niue News provides users with complete control over their personal data, including the right to request permanent deletion of their account and associated data.

### 1. What Data Can Be Deleted
Upon receiving your request, we will permanently remove:
- Your user profile details (Name, email address, profile avatar, and account ID).
- Your authentication credentials and login session tokens.
- Any unpublished article drafts authored under your account.
- Any reader reviews, ratings, or feedback tied to your account identifier.

### 2. How to Request Data Deletion

#### Option A: Direct Email Request (Recommended)
You can request account and data deletion at any time by sending an email from your registered email address to:
- **Email:** privacy@niuenews.nu
- **Subject:** Data Deletion Request
- **Details:** Please specify your full name and registered email address.

#### Option B: Disconnecting Third-Party Login
If you signed in using Google or Facebook:
- **Google Account:** Visit your Google Account Security Settings under Third-Party Apps, select Niue News, and click "Remove Access".
- **Facebook Account:** Go to Facebook Settings & Privacy > Settings > Apps and Websites, locate News Niue, and click "Remove".

### 3. Processing Timeline & Confirmation
Once your request is received, our administration team will process the permanent deletion within 30 business days. You will receive an email confirmation once your data has been completely erased.

### 4. Questions & Support
If you have any questions or require assistance regarding the data deletion process, please contact our privacy desk at privacy@niuenews.nu.`,
    updatedAt: '2026-10-12T00:00:00.000Z'
  }
};

export const DEFAULT_SOCIAL_LINKS: SocialLinksContent = {
  facebook: 'https://www.facebook.com/1358660107330903',
  x: 'https://x.com/niuenews',
  instagram: 'https://www.instagram.com/niuenews',
  youtube: 'https://www.youtube.com/@niuenews',
  footerTagline: 'Ko e Motu Fakahelehele — Connecting Niue and our global diaspora with trusted stories, culture, and community voices.',
  aboutSummary: 'Niue News is the independent digital community news hub for the island nation of Niue and our global diaspora worldwide.'
};

/**
 * Fetch a site page from Firestore with fallback to defaults.
 */
export async function getSitePage(pageId: string): Promise<SitePageContent> {
  const fallback = DEFAULT_PAGES[pageId] || {
    id: pageId,
    title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
    subtitle: '',
    content: ''
  };

  try {
    const docRef = doc(db, 'site_pages', pageId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        ...fallback,
        ...docSnap.data(),
        id: pageId
      };
    }
  } catch (err) {
    console.warn(`Could not load site_pages/${pageId} from Firestore, using default content:`, err);
  }

  return fallback;
}

/**
 * Fetch social media links and footer settings from Firestore with fallback.
 */
export async function getSocialLinks(): Promise<SocialLinksContent> {
  try {
    const docRef = doc(db, 'site_pages', 'social_links');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        ...DEFAULT_SOCIAL_LINKS,
        ...docSnap.data()
      };
    }
  } catch (err) {
    console.warn('Could not load site_pages/social_links, using defaults:', err);
  }

  return DEFAULT_SOCIAL_LINKS;
}

/**
 * Simple markdown-like text parser that formats headings, bold text, lists, and paragraphs.
 */
export function formatContentToParagraphs(rawText: string): Array<{ type: 'heading' | 'subheading' | 'paragraph' | 'list'; content: string; items?: string[] }> {
  if (!rawText) return [];

  const blocks = rawText.split(/\n\s*\n/);
  const result: Array<{ type: 'heading' | 'subheading' | 'paragraph' | 'list'; content: string; items?: string[] }> = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('### ')) {
      result.push({ type: 'subheading', content: trimmed.replace(/^###\s+/, '') });
    } else if (trimmed.startsWith('## ')) {
      result.push({ type: 'heading', content: trimmed.replace(/^##\s+/, '') });
    } else if (trimmed.startsWith('# ')) {
      result.push({ type: 'heading', content: trimmed.replace(/^#\s+/, '') });
    } else if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
      const items = trimmed
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => line.replace(/^-\s+/, ''));
      result.push({ type: 'list', content: '', items });
    } else {
      result.push({ type: 'paragraph', content: trimmed });
    }
  }

  return result;
}
