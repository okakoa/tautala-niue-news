
I have reworked the mobile screen formatting and typography across the app to deliver an intuitive, comfortable, and modern mobile news reading experience.

What Was Improved for Mobile Screens:
Compact, Above-the-Fold Hero Section

Problem in screenshot: The oversized headline and 4 wrapped rows of category pills consumed the entire mobile viewport, leaving zero news articles visible when loading the app.
Solution: Scaled down mobile hero padding and headline typography (clamp(1.55rem, 5vw, 2.3rem)), significantly reducing the vertical footprint so the latest news stories are immediately visible above or right at the fold.
Interactive Horizontal Category Chips (Native App Feel)

Replaced the stacked pile of category pills with a horizontally swipeable category chip bar (overflow-x: auto with touch inertia and hidden scrollbars), just like modern news apps (BBC News, Apple News, Google News).
Added interactive filtering: Tapping any chip (e.g., Community, Sports, Health, Politics) instantly filters the articles below to that category, with a prominent active yellow-gold indicator and a "Clear filter" toggle.
News Article Cards Optimized for Mobile

Proportional Padding: Reduced card padding on mobile from 30px to 16px, maximizing usable text reading width on phone screens.
Tappable Headlines & Direct Navigation: Headline titles now link directly to the full story, sized at a clean 1.2rem on phones so titles don't wrap awkwardly.
Clear Visual Hierarchy: Category badge and publication date sit neatly in a top header row; the author byline is subtle; and the responsive featured image preserves its 16:9 aspect ratio.
Prominent Touch Target: Added a full-width Read full article → button designed for easy one-hand thumb tapping.
Dedicated Article Reader Page (/article/[id])

Editorial Typography: Styled body copy with 17px font size, #1e293b warm dark-gray contrast, and 1.8 line-height to eliminate eye strain during long-form reading.
Back Navigation: Touch-friendly ← Back to News Hub button.
Touch-Friendly Reviews: Responsive star ratings and balanced side-by-side (👍 / 👎) thumb recommendation buttons that stack cleanly without overflowing.
Responsive Navbar with Mobile Drawer

On mobile screens, the header collapses into a compact navigation bar with the logo and a hamburger menu.
Tapping the hamburger button slides down an accessible navigation drawer with comfortable touch targets (Home, Submit Story, Dashboard, Sign Out / Sign In).
Smart Floating Watermark

On mobile screens (max-width: 768px), the watermark scales down to 75px and has pointer-events: none enabled so it will never block touch taps or scrolling on small screens.
Dashboard & Forms Adaptability

Added responsive wrapping to the Dashboard sidebar menu and editing action buttons across Drafts and Pending moderation views to avoid horizontal clipping.
Enforced 16px minimum font size on inputs to prevent iOS Safari auto-zooming.