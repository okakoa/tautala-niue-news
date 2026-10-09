import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing Token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (decodedToken.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Only Super Admins can manage accounts.' }, { status: 403 });
    }

    const { uid, action } = await request.json();
    
    if (!uid || !action) {
      return NextResponse.json({ error: 'Missing uid or action' }, { status: 400 });
    }

    if (action === 'disable') {
      await adminAuth.updateUser(uid, { disabled: true });
      await adminDb.collection('users').doc(uid).update({ disabled: true, updatedAt: new Date().toISOString() });
    } else if (action === 'enable') {
      await adminAuth.updateUser(uid, { disabled: false });
      await adminDb.collection('users').doc(uid).update({ disabled: false, updatedAt: new Date().toISOString() });
    } else if (action === 'delete') {
      await adminAuth.deleteUser(uid);
      await adminDb.collection('users').doc(uid).delete();
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ message: `Successfully performed ${action} on user.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
