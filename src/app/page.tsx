'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Link from 'next/link';

const CATEGORIES = [
  'All News',
  'Community',
  'Health',
  'Education',
  'Politics',
  'Sports',
  'Entertainment',
  'Technology',
  'Regional & Global',
];

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All News');

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

  // Filter articles by category
  const filteredArticles = selectedCategory === 'All News'
    ? articles
    : articles.filter(a => {
        const cat = (a.category || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();
        return cat === sel || cat.startsWith(sel) || sel.startsWith(cat);
      });

  return (
    <main>
      {/* --- HERO SECTION --- */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Welcome to Niue News Hub</h1>
          <p className="hero-subtitle">
            The global platform connecting writers, creators, and the Niuean community.
            Read the latest news, or submit your own story!
          </p>

          {/* Interactive Category Chips Bar */}
          <div className="categories-wrapper">
            <div className="categories-container" role="tablist" aria-label="News categories">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedCategory(cat)}
                    className={`category-chip ${isActive ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* --- COMMUNITY NEWS SECTION --- */}
      <section className="news-section">
        <div className="container" style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 className="news-section-title" style={{ margin: 0, textAlign: 'left', borderBottom: 'none' }}>
              {selectedCategory === 'All News' ? 'Latest Community Stories' : `${selectedCategory} News`}
            </h2>
            {selectedCategory !== 'All News' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('All News')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#002B7F',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Clear filter (Show all)
              </button>
            )}
          </div>

          {articlesLoading ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '60px 20px' }}>
              <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
              <p style={{ fontWeight: 500 }}>Loading latest stories...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: '18px', color: '#002B7F', fontWeight: 'bold' }}>
                {selectedCategory === 'All News' 
                  ? 'No stories have been published yet.' 
                  : `No stories found in "${selectedCategory}".`}
              </p>
              <p style={{ marginTop: '8px', fontSize: '15px' }}>
                {selectedCategory === 'All News' ? (
                  <>Check back soon, or <Link href="/submit" style={{ color: '#CE1126', fontWeight: 'bold', textDecoration: 'underline' }}>submit a story</Link> yourself!</>
                ) : (
                  <button 
                    onClick={() => setSelectedCategory('All News')}
                    style={{ background: '#002B7F', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
                  >
                    View All Stories
                  </button>
                )}
              </p>
            </div>
          ) : (
            <div className="news-cards-list">
              {filteredArticles.map(article => (
                <article 
                  key={article.id} 
                  className="article-card"
                  style={{
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
                  {/* Category badge & formatted date */}
                  <div className="article-card-header">
                    <span className="article-category-badge">
                      {article.category || 'General'}
                    </span>
                    <span className="article-date-badge">
                      {new Date(article.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="article-card-title">
                    <Link href={`/article/${article.id}`}>
                      {article.title}
                    </Link>
                  </h3>

                  {/* Author Byline */}
                  <p className="article-byline">
                    By <strong style={{ color: '#1e293b' }}>{article.authorName}</strong>
                  </p>

                  {/* Optional Featured Image */}
                  {article.imageUrl && (
                    <div className="article-image-wrap">
                      <Link href={`/article/${article.id}`}>
                        <img 
                          src={article.imageUrl} 
                          alt={article.title || 'Article Header'} 
                          loading="lazy"
                        />
                      </Link>
                      {article.imageCredit && (
                        <p className="article-image-credit">
                          {article.imageCredit}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Snippet / Preview Text */}
                  <div className="article-preview-text">
                    {(() => {
                      const paragraphs = (article.content || '').split(/\n+/).filter((p: string) => p.trim() !== '');
                      const preview = paragraphs.slice(0, 2).join('\n\n');
                      return (
                        <>
                          <div>{preview}</div>
                          <div className="article-read-cta">
                            <Link href={`/article/${article.id}`} className="article-read-btn">
                              Read full article →
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

