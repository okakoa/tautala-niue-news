import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    if (pageId) {
      const docSnap = await adminDb.collection('site_pages').doc(pageId).get();
      if (!docSnap.exists) {
        return NextResponse.json({ found: false, data: null });
      }
      return NextResponse.json({ found: true, data: docSnap.data() });
    }

    // Return all pages
    const snapshot = await adminDb.collection('site_pages').get();
    const pages: Record<string, unknown> = {};
    snapshot.forEach(doc => {
      pages[doc.id] = doc.data();
    });

    return NextResponse.json({ pages });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing Token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (decodedToken.role !== 'super_admin' && decodedToken.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only Super Admins and Admins can update site pages.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { pageId, data } = body;

    if (!pageId || !data) {
      return NextResponse.json({ error: 'Missing pageId or data' }, { status: 400 });
    }

    const updatePayload = {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: decodedToken.email || decodedToken.uid,
    };

    await adminDb.collection('site_pages').doc(pageId).set(updatePayload, { merge: true });

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${pageId} content`,
      updatedAt: updatePayload.updatedAt,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error saving site page:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
