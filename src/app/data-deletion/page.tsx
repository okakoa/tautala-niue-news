'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getSitePage, SitePageContent, DEFAULT_PAGES, formatContentToParagraphs } from '@/lib/siteContent';

export default function DataDeletionPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<SitePageContent>(DEFAULT_PAGES.data_deletion);
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
    getSitePage('data_deletion').then(res => {
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
        <span className="crumb-current">Data Deletion Instructions</span>
      </div>

      {/* Hero Header */}
      <header className="site-page-hero">
        <div className="container">
          <div className="site-page-badge">
            <span>🛡️</span> User Privacy & Data Protection
          </div>
          <h1 className="site-page-title">{data.title}</h1>
          {data.subtitle && <p className="site-page-subtitle">{data.subtitle}</p>}

          {isAdmin && (
            <div className="site-page-admin-bar">
              <Link href="/dashboard/pages?tab=data_deletion" className="btn-edit-site-page">
                <span>✏️</span> Edit Data Deletion Instructions (Admin)
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="container site-page-body">
        <div className="site-page-card">
          
          <div className="policy-intro-banner">
            <div className="banner-icon">🗑️</div>
            <div>
              <strong>Complete Control Over Your Personal Information</strong>
              <p>Niue News honors all user requests to delete account credentials, authentication profiles, and personal data in compliance with Google and Meta platform requirements.</p>
            </div>
          </div>

          {loading ? (
            <div className="site-page-loading">
              <div className="spinner"></div>
              <p>Loading Data Deletion Instructions...</p>
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

          {/* Quick Actions Footer Box */}
          <div className="site-page-cta policy-cta">
            <h3>Ready to submit a deletion request?</h3>
            <p>Send an email request to our data protection team or review our complete privacy policy.</p>
            <div className="cta-actions">
              <a 
                href="mailto:privacy@niuenews.nu?subject=Data%20Deletion%20Request%20-%20Niue%20News" 
                className="btn-cta-primary"
              >
                Send Deletion Request Email
              </a>
              <Link href="/privacy" className="btn-cta-secondary">
                View Privacy Policy
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
