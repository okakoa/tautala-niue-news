'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

import { Suspense } from 'react';

function ArticleContent() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Form state
  const [rating, setRating] = useState<number>(0);
  const [recommend, setRecommend] = useState<'yes' | 'no' | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        const docRef = doc(db, 'articles', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status !== 'published') {
            setArticle(null);
          } else {
            setArticle({ id: docSnap.id, ...data });
          }
        } else {
          setArticle(null);
        }
      } catch (err) {
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), where('articleId', '==', id as string));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort newest first
      list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setReviews(list);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!user) {
      setFormError('You must be signed in to leave a review.');
      return;
    }

    if (rating === 0) {
      setFormError('Please select a star rating.');
      return;
    }

    if (!recommend) {
      setFormError('Please select thumbs up or thumbs down.');
      return;
    }

    if (!reviewText.trim()) {
      setFormError('Please write a review.');
      return;
    }

    const wordCount = reviewText.trim() ? reviewText.trim().split(/\s+/).length : 0;
    if (wordCount > 100) {
      setFormError(`Review is too long (${wordCount} words). Please limit your review to 100 words.`);
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        articleId: id,
        userId: user.uid,
        userName: user.email?.split('@')[0] || 'Anonymous',
        rating,
        recommend,
        text: reviewText.trim(),
        createdAt: new Date().toISOString()
      });
      setFormSuccess('Review submitted successfully!');
      setRating(0);
      setRecommend(null);
      setReviewText('');
      fetchReviews(); // Refresh reviews
    } catch (err: any) {
      setFormError(`Failed to submit review: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', fontSize: '18px', color: '#666' }}>
        <div className="spinner" style={{ margin: '0 auto 20px auto' }}></div>
        Loading article...
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <h2 style={{ color: '#CE1126', fontSize: '32px' }}>Article Not Found</h2>
        <p style={{ marginTop: '20px', fontSize: '18px', color: '#666' }}>This article may have been removed or is no longer published.</p>
        <button 
          onClick={() => router.push('/')}
          style={{ marginTop: '30px', padding: '12px 24px', backgroundColor: '#002B7F', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <main style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* ARTICLE CONTENT */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '6px solid #CE1126', marginBottom: '40px' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '30px', color: '#002B7F', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}>
            &larr; Back to News Hub
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ backgroundColor: '#FCD116', color: '#333', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
              {article.category}
            </span>
          </div>
          
          <h1 style={{ color: '#002B7F', fontSize: '42px', lineHeight: '1.2', marginBottom: '20px' }}>
            {article.title}
          </h1>
          
          <p style={{ fontSize: '16px', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '40px' }}>
            Written by <strong style={{color: '#333'}}>{article.authorName}</strong> | {new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          
          <div 
            style={{ 
              fontSize: '18px', 
              lineHeight: '1.8', 
              color: '#222', 
              whiteSpace: 'pre-wrap',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
            onCopy={(e) => {
              e.preventDefault();
              alert('Copying content is disabled by the author to protect intellectual property.');
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {article.content}
          </div>
        </div>

        {/* REVIEW SECTION */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#002B7F', borderBottom: '2px solid #FCD116', paddingBottom: '10px', marginBottom: '30px' }}>Reader Reviews</h2>
          
          {/* REVIEW FORM */}
          <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '8px', marginBottom: '40px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0, color: '#333', marginBottom: '20px' }}>Leave a Review</h3>
            
            {formError && <div style={{ padding: '12px', backgroundColor: '#ffe6e6', color: '#CE1126', border: '1px solid #CE1126', borderRadius: '4px', marginBottom: '20px', fontWeight: 'bold' }}>{formError}</div>}
            {formSuccess && <div style={{ padding: '12px', backgroundColor: '#e6ffe6', color: '#28a745', border: '1px solid #28a745', borderRadius: '4px', marginBottom: '20px', fontWeight: 'bold' }}>{formSuccess}</div>}

            {!user ? (
              <p style={{ fontSize: '16px', color: '#555' }}>You must be <Link href="/login" style={{ color: '#002B7F', fontWeight: 'bold', textDecoration: 'underline' }}>logged in</Link> to leave a review.</p>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <div style={{ display: 'flex', gap: '40px', marginBottom: '25px', flexWrap: 'wrap' }}>
                  
                  {/* Star Rating */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#555' }}>Star Rating</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          onClick={() => setRating(star)}
                          style={{ fontSize: '32px', cursor: 'pointer', color: star <= rating ? '#FCD116' : '#ddd', userSelect: 'none', transition: 'color 0.2s' }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Thumbs */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#555' }}>Do you recommend this?</label>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button 
                        type="button" 
                        onClick={() => setRecommend('yes')}
                        style={{ padding: '10px 20px', fontSize: '18px', backgroundColor: recommend === 'yes' ? '#e6ffe6' : '#fff', border: recommend === 'yes' ? '2px solid #28a745' : '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        👍 Yes
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setRecommend('no')}
                        style={{ padding: '10px 20px', fontSize: '18px', backgroundColor: recommend === 'no' ? '#ffe6e6' : '#fff', border: recommend === 'no' ? '2px solid #CE1126' : '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        👎 No
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#555' }}>
                    Your Review <span style={{ fontWeight: 'normal', fontSize: '13px', color: '#888' }}>(max 100 words)</span>
                  </label>
                  <textarea 
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    placeholder="What did you think about this article?"
                    style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', fontFamily: 'inherit', resize: 'vertical' }}
                  ></textarea>
                  <div style={{ textAlign: 'right', fontSize: '13px', color: reviewText.trim() ? (reviewText.trim().split(/\s+/).length > 100 ? '#CE1126' : '#888') : '#888', marginTop: '8px', fontWeight: reviewText.trim() && reviewText.trim().split(/\s+/).length > 100 ? 'bold' : 'normal' }}>
                    {reviewText.trim() ? reviewText.trim().split(/\s+/).length : 0} / 100 words
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ padding: '12px 30px', backgroundColor: '#002B7F', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}
          </div>

          {/* LIST OF REVIEWS */}
          <div>
            {reviewsLoading ? (
              <p style={{ color: '#666', fontSize: '16px' }}>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic', fontSize: '16px' }}>No reviews yet. Be the first to share your thoughts!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#333', fontSize: '18px' }}>{review.userName}</div>
                      <div style={{ fontSize: '14px', color: '#888' }}>
                        {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                      <div style={{ color: '#FCD116', fontSize: '20px' }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                      <div style={{ fontSize: '20px' }}>
                        {review.recommend === 'yes' ? '👍' : '👎'}
                      </div>
                    </div>
                    <p style={{ color: '#444', lineHeight: '1.6', margin: 0, fontSize: '16px' }}>
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>}>
      <ArticleContent />
    </Suspense>
  );
}
