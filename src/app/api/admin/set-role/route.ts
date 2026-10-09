import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    // 1. Verify the requester is actually a super_admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing Token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Only allow super_admins and admins to change roles
    if (decodedToken.role !== 'super_admin' && decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only Super Admins and Admins can assign roles.' }, { status: 403 });
    }

    const { uid, newRole } = await request.json();
    
    if (!uid || !newRole) {
      return NextResponse.json({ error: 'Missing uid or newRole' }, { status: 400 });
    }

    // 2. Set the custom claim securely in Firebase Auth
    await adminAuth.setCustomUserClaims(uid, { role: newRole });

    // 3. Update the Firestore user document so the UI can display it
    await adminDb.collection('users').doc(uid).update({
      role: newRole,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ message: `Successfully updated role to ${newRole}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
