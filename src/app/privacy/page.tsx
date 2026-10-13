'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getSitePage, SitePageContent, DEFAULT_PAGES, formatContentToParagraphs } from '@/lib/siteContent';

export default function PrivacyPolicyPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<SitePageContent>(DEFAULT_PAGES.privacy);
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
    getSitePage('privacy').then(res => {
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
        <span className="crumb-current">Privacy Policy</span>
      </div>

      {/* Hero Header */}
      <header className="site-page-hero">
        <div className="container">
          <div className="site-page-badge">
            <span>🔒</span> Reader Trust & Data Safety
          </div>
          <h1 className="site-page-title">{data.title}</h1>
          {data.subtitle && <p className="site-page-subtitle">{data.subtitle}</p>}

          {isAdmin && (
            <div className="site-page-admin-bar">
              <Link href="/dashboard/pages?tab=privacy" className="btn-edit-site-page">
                <span>✏️</span> Edit Privacy Policy (Admin)
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="container site-page-body">
        <div className="site-page-card">
          
          <div className="policy-intro-banner">
            <div className="banner-icon">🛡️</div>
            <div>
              <strong>Protecting Your Digital Privacy</strong>
              <p>Niue News is committed to ethical journalism, transparent data practices, and safeguarding our readers and content contributors.</p>
            </div>
          </div>

          {loading ? (
            <div className="site-page-loading">
              <div className="spinner"></div>
              <p>Loading Privacy Policy...</p>
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

          {/* Contact Section for Privacy Requests */}
          <div className="site-page-cta policy-cta">
            <h3>Questions about your personal data?</h3>
            <p>If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact our team.</p>
            <div className="cta-actions">
              <Link 
                href="/data-deletion" 
                className="btn-cta-primary"
              >
                Data Deletion Instructions
              </Link>
              <Link href="/terms" className="btn-cta-secondary">
                View Terms of Service
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
