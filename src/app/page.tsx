'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Link from 'next/link';

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  useEffect(() => {
    // Fetch Published Articles
    const fetchArticles = async () => {
      setArticlesLoading(true);
      try {
        const q = query(
          collection(db, 'articles'), 
          where('status', '==', 'published')
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as any));
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setArticles(list);
      } catch (err) {
        console.error("Error fetching articles:", err);
      } finally {
        setArticlesLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Welcome to Niue News Hub</h1>
          <p>
            The global platform connecting writers, creators, and the Niuean community. 
            Read the latest news, or submit your own story for our global community!
          </p>
          <div className="categories">
            <span className="category-tag">Community</span>
            <span className="category-tag">Health</span>
            <span className="category-tag">Education</span>
            <span className="category-tag">Politics</span>
            <span className="category-tag">Sports</span>
            <span className="category-tag">Entertainments</span>
            <span className="category-tag">Technology</span>
            <span className="category-tag">Regional & Global</span>
          </div>
        </div>
      </section>

      {/* --- COMMUNITY NEWS SECTION --- */}
      <section style={{ backgroundColor: '#f4f6f8', padding: '60px 20px', minHeight: '500px' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ color: '#002B7F', borderBottom: '3px solid #FCD116', paddingBottom: '10px', marginBottom: '30px', textAlign: 'center', fontSize: '32px' }}>
            Latest Community News
          </h2>

          {articlesLoading ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>Loading news...</div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '60px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '20px', color: '#002B7F', fontWeight: 'bold' }}>No stories have been published yet.</p>
              <p style={{ marginTop: '10px', fontSize: '16px' }}>Check back soon, or <Link href="/submit" style={{ color: '#CE1126', fontWeight: 'bold', textDecoration: 'underline' }}>submit a story</Link> yourself!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {articles.map(article => (
                <article 
                  key={article.id} 
                  style={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    padding: '30px', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.08)', 
                    borderTop: '5px solid #CE1126',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                  onCopy={(e) => {
                    e.preventDefault();
                    alert('Copying content is disabled by the author to protect intellectual property.');
                  }}
                  onCut={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#002B7F', fontSize: '26px', lineHeight: '1.3' }}>{article.title}</h3>
                    <span style={{ backgroundColor: '#FCD116', color: '#333', padding: '6px 14px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '15px' }}>
                      {article.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#888', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    Written by <strong style={{color: '#333'}}>{article.authorName}</strong> | {new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>

                  {article.imageUrl && (
                    <div style={{ marginBottom: '20px' }}>
                      <img src={article.imageUrl} alt="Article Header" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '6px' }} />
                      {article.imageCredit && <p style={{ fontSize: '11px', color: '#aaa', marginTop: '5px', fontStyle: 'italic' }}>{article.imageCredit}</p>}
                    </div>
                  )}

                  <div style={{ fontSize: '16px', lineHeight: '1.7', color: '#222', whiteSpace: 'pre-wrap' }}>
                    {(() => {
                      const paragraphs = article.content.split(/\n+/).filter((p: string) => p.trim() !== '');
                      const isTruncated = paragraphs.length > 3;
                      const preview = paragraphs.slice(0, 3).join('\n\n');
                      return (
                        <>
                          {preview}
                          <div style={{ marginTop: '20px' }}>
                            <Link href={`/article/${article.id}`} style={{ color: '#002B7F', fontWeight: 'bold', textDecoration: 'none', borderBottom: '2px solid #FCD116', paddingBottom: '2px' }}>
                              {isTruncated ? "... continue to read full article" : "Read full article"}
                            </Link>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
