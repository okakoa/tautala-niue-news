import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

// Note: To use this with Vercel Cron, configure it in vercel.json.
// For testing locally, you can send a GET request to /api/cron/publish-scheduled

export async function GET() {
  try {
    const now = new Date().toISOString();
    
    // Query articles that are 'scheduled' and their scheduledPublishDate is past
    const snapshot = await db.collection('articles')
      .where('status', '==', 'scheduled')
      .where('scheduledPublishDate', '<=', now)
      .get();
      
    if (snapshot.empty) {
      return NextResponse.json({ message: 'No articles to publish at this time.' });
    }
    
    const batch = db.batch();
    let publishedCount = 0;
    
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'published',
        publishedAt: now // Keep track of when it actually went live
      });
      publishedCount++;
    });
    
    await batch.commit();
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully published ${publishedCount} scheduled article(s).`
    });
  } catch (error: any) {
    console.error('Error publishing scheduled articles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
