'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getSitePage, SitePageContent, DEFAULT_PAGES, formatContentToParagraphs } from '@/lib/siteContent';

export default function AboutPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<SitePageContent>(DEFAULT_PAGES.about);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (user) {
      user.getIdTokenResult().then(result => {
        if (active) {
          const role = (result.claims.role as string) || 'standard';
          setIsAdmin(role === 'super_admin' || role === 'admin');
        }
      });
    } else {
      queueMicrotask(() => {
        if (active) setIsAdmin(false);
      });
    }
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    getSitePage('about').then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const parsedBlocks = formatContentToParagraphs(data.content);

  return (
    <div className="site-page-container">
      {/* Breadcrumbs */}
      <div className="container site-page-breadcrumbs">
        <Link href="/">Home</Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">About Us</span>
      </div>

      {/* Hero Header */}
      <header className="site-page-hero">
        <div className="container">
          <div className="site-page-badge">
            <span>ℹ️</span> About Niue News
          </div>
          <h1 className="site-page-title">{data.title}</h1>
          {data.subtitle && <p className="site-page-subtitle">{data.subtitle}</p>}
          
          {isAdmin && (
            <div className="site-page-admin-bar">
              <Link href="/dashboard/pages?tab=about" className="btn-edit-site-page">
                <span>✏️</span> Edit About Page Content (Admin)
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="container site-page-body">
        <div className="site-page-card">
          {loading ? (
            <div className="site-page-loading">
              <div className="spinner"></div>
              <p>Loading About page...</p>
            </div>
          ) : (
            <div className="site-page-prose">
              {parsedBlocks.map((block, idx) => {
                if (block.type === 'heading') {
                  return <h2 key={idx} className="prose-h2">{block.content}</h2>;
                }
                if (block.type === 'subheading') {
                  return <h3 key={idx} className="prose-h3">{block.content}</h3>;
                }
                if (block.type === 'list') {
                  return (
                    <ul key={idx} className="prose-ul">
                      {block.items?.map((item, itemIdx) => (
                        <li key={itemIdx}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx} className="prose-p">{block.content}</p>;
              })}
            </div>
          )}

          {/* Call to Action */}
          <div className="site-page-cta">
            <h3>Have a Story to Tell?</h3>
            <p>Every Niuean voice matters. Join our community of local storytellers and writers.</p>
            <div className="cta-actions">
              {user && (
                <Link href="/submit" className="btn-cta-primary">
                  Submit a Story
                </Link>
              )}
              <Link href="/contact" className="btn-cta-secondary">
                Get in Touch
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
