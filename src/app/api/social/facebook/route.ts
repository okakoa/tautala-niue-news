import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

/**
 * Helper function to extract the exact preview text matching the home webpage article card.
 * In the homepage (src/app/page.tsx), content is split by one or more newlines and takes the first 2 paragraphs.
 */
function extractCardSnippet(content: string): string {
  if (!content) return '';

  const paragraphs = content
    .split(/\r?\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return paragraphs.slice(0, 2).join('\n\n');
}

/**
 * GET /api/social/facebook
 * Health check & credential verification endpoint.
 */
export async function GET() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !pageAccessToken) {
    return NextResponse.json(
      {
        configured: false,
        error: 'FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN is missing in environment variables.',
      },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}?fields=name,id&access_token=${pageAccessToken}`
    );
    const data = await res.json();

    if (data.error) {
      let hint = '';
      if (data.error.message?.includes('Cannot call API for app')) {
        hint = 'Your Meta App is in Development mode and this user lacks an Administrator/Developer role in App Roles, or the token is a User token instead of a Page Access Token.';
      }
      return NextResponse.json({ configured: false, error: data.error, hint }, { status: 400 });
    }

    return NextResponse.json({
      configured: true,
      page: data,
      message: 'Facebook credentials are valid and active.',
    });
  } catch (error: any) {
    return NextResponse.json({ configured: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/social/facebook
 * Publishes the article headline, first 3 paragraphs, and site link to the Facebook Page.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, articleUrl } = body;

    const pageId = process.env.FACEBOOK_PAGE_ID;
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    if (!pageId || !pageAccessToken) {
      return NextResponse.json(
        { error: 'Facebook Page credentials not configured in environment.' },
        { status: 500 }
      );
    }

    let title = body.title || '';
    let content = body.content || '';
    let imageUrl = body.imageUrl || '';
    let docRef: FirebaseFirestore.DocumentReference | null = null;

    // If an articleId is passed, fetch fresh content directly from Firestore
    if (articleId) {
      docRef = adminDb.collection('articles').doc(articleId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
      }

      const data = docSnap.data();
      title = data?.title || title;
      content = data?.content || content;
      imageUrl = data?.imageUrl || imageUrl;
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Article has no content to share.' },
        { status: 400 }
      );
    }

    // 1. Extract the preview snippet matching the homepage article card (first 2 paragraphs)
    const cardSnippet = extractCardSnippet(content);

    // 2. Format article link (always prioritize configured hosted app URL over localhost)
    let origin: string = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '';
    if (!origin) {
      if (articleUrl && !articleUrl.includes('localhost')) {
        origin = articleUrl;
      } else if (req.nextUrl?.origin && !req.nextUrl.origin.includes('localhost')) {
        origin = req.nextUrl.origin;
      } else {
        origin = 'http://localhost:3000';
      }
    }
    origin = origin.replace(/\/+$/, '');

    const finalUrl = articleId ? `${origin}/article/${articleId}` : origin;

    // 3. Compose Facebook post message matching the homepage article card exactly
    const messageParts: string[] = [];
    if (title) {
      messageParts.push(title);
    }
    if (cardSnippet) {
      messageParts.push(cardSnippet);
    }
    if (finalUrl) {
      messageParts.push(`Read full article → ${finalUrl}`);
    }

    const postMessage = messageParts.join('\n\n');

    let fbRes: Response;
    let fbData: any;

    // 4. Send to Facebook Graph API (with Photo if available, or Feed if text only)
    if (imageUrl) {
      const formData = new FormData();
      formData.append('caption', postMessage);
      formData.append('access_token', pageAccessToken);

      if (imageUrl.startsWith('data:image/')) {
        // Base64 Data URL
        const match = imageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          const buffer = Buffer.from(base64Data, 'base64');
          const ext = mimeType.split('/')[1]?.split('+')[0] || 'jpg';
          const blob = new Blob([buffer], { type: mimeType });
          formData.append('source', blob, `article-photo.${ext}`);
        } else {
          // Fallback if regex fails: attach raw buffer
          const rawBase64 = imageUrl.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(rawBase64, 'base64');
          const blob = new Blob([buffer], { type: 'image/jpeg' });
          formData.append('source', blob, 'article-photo.jpg');
        }
      } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Public hosted image URL
        formData.append('url', imageUrl);
      }

      fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: 'POST',
        body: formData,
      });
      fbData = await fbRes.json();
    } else {
      // Text-only feed post
      const fbPayload: Record<string, string> = {
        message: postMessage,
        access_token: pageAccessToken,
      };

      if (finalUrl && finalUrl.startsWith('https://')) {
        fbPayload.link = finalUrl;
      }

      fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fbPayload),
      });
      fbData = await fbRes.json();
    }

    if (fbData.error) {
      console.error('Facebook Graph API Error:', fbData.error);
      let descriptiveMessage = fbData.error.message || 'Failed to publish to Facebook.';
      if (fbData.error.code === 200 || fbData.error.message?.includes('Cannot call API for app')) {
        descriptiveMessage = `Meta App in Development Mode: The user (${fbData.error.message?.match(/\d+$/)?.[0] || 'account'}) is not assigned an Admin/Developer role in the Meta App, or a Page Access Token is required.`;
      } else if (fbData.error.code === 190) {
        descriptiveMessage = `Facebook Access Token expired or invalid. Please generate a fresh Page Access Token.`;
      }

      return NextResponse.json(
        {
          success: false,
          error: descriptiveMessage,
          fbError: fbData.error,
        },
        { status: 400 }
      );
    }

    // Determine created post ID (photo endpoint returns post_id or id)
    const finalPostId = fbData.post_id || fbData.id;

    // 5. If we have a Firestore document, record the Facebook post ID
    if (docRef) {
      await docRef.update({
        facebookPostId: finalPostId,
        facebookPostedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      postId: finalPostId,
      message: 'Successfully posted article with photo to Facebook Page!',
    });
  } catch (error: any) {
    console.error('Error posting to Facebook:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
