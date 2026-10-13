'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { getSitePage, SitePageContent, DEFAULT_PAGES, formatContentToParagraphs } from '@/lib/siteContent';

export default function ContactPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<SitePageContent>(DEFAULT_PAGES.contact);
  const [loading, setLoading] = useState(true);

  // Contact form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('News Tip');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let active = true;
    if (user) {
      user.getIdTokenResult().then(result => {
        if (active) {
          const role = (result.claims.role as string) || 'standard';
          setIsAdmin(role === 'super_admin' || role === 'admin');
        }
      });
      queueMicrotask(() => {
        if (active) {
          if (user.displayName) setSenderName(user.displayName);
          if (user.email) setSenderEmail(user.email);
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
    getSitePage('contact').then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) {
      setFormError('Please fill in your name, email, and message.');
      return;
    }

    setSending(true);
    setFormError('');
    setFormSuccess(false);

    try {
      await addDoc(collection(db, 'contact_messages'), {
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        subject,
        message: message.trim(),
        userId: user ? user.uid : null,
        status: 'unread',
        createdAt: new Date().toISOString()
      });

      setFormSuccess(true);
      setMessage('');
      if (!user) {
        setSenderName('');
        setSenderEmail('');
      }
    } catch (err: unknown) {
      console.error('Error submitting contact message:', err);
      // Even if Firestore rules restrict direct writes, give a reassuring message with the email fallback
      setFormError('There was a slight issue sending online. Please email us directly at ' + (data.email || 'contact@niuenews.nu'));
    } finally {
      setSending(false);
    }
  };

  const parsedBlocks = formatContentToParagraphs(data.content);

  return (
    <div className="site-page-container">
      {/* Breadcrumbs */}
      <div className="container site-page-breadcrumbs">
        <Link href="/">Home</Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">Contact Us</span>
      </div>

      {/* Hero Header */}
      <header className="site-page-hero">
        <div className="container">
          <div className="site-page-badge">
            <span>📬</span> Reach the Editorial Desk
          </div>
          <h1 className="site-page-title">{data.title}</h1>
          {data.subtitle && <p className="site-page-subtitle">{data.subtitle}</p>}

          {isAdmin && (
            <div className="site-page-admin-bar">
              <Link href="/dashboard/pages?tab=contact" className="btn-edit-site-page">
                <span>✏️</span> Edit Contact Details (Admin)
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="container site-page-body">
        
        {/* Contact Info Cards */}
        <div className="contact-cards-grid">
          <div className="contact-info-card">
            <div className="contact-card-icon">📧</div>
            <h3>General Inquiries</h3>
            <p className="contact-card-value">
              <a href={`mailto:${data.email || 'contact@niuenews.nu'}`}>
                {data.email || 'contact@niuenews.nu'}
              </a>
            </p>
            <span className="contact-card-hint">Press releases & partnerships</span>
          </div>

          <div className="contact-info-card highlight">
            <div className="contact-card-icon">⚡</div>
            <h3>News Tips & Breaking</h3>
            <p className="contact-card-value">
              <a href={`mailto:${data.newsTipsEmail || 'tips@niuenews.nu'}`}>
                {data.newsTipsEmail || 'tips@niuenews.nu'}
              </a>
            </p>
            <span className="contact-card-hint">Anonymous tips & village events</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-card-icon">📞</div>
            <h3>Phone & Office</h3>
            <p className="contact-card-value">{data.phone || '+683 4000'}</p>
            <span className="contact-card-hint">{data.officeHours || 'Mon-Fri: 8am - 4pm'}</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-card-icon">📍</div>
            <h3>Location</h3>
            <p className="contact-card-value">{data.address || 'Alofi South, Niue'}</p>
            <span className="contact-card-hint">Central Commercial Centre</span>
          </div>
        </div>

        {/* Two-Column Layout: Editorial Prose & Contact Form */}
        <div className="contact-content-grid">
          
          {/* Left Column: Guidelines & Editorial text */}
          <div className="site-page-card contact-prose-card">
            <h2 className="prose-h2" style={{ marginTop: 0 }}>Community Guidelines & Tips</h2>
            {loading ? (
              <div className="site-page-loading">
                <div className="spinner"></div>
                <p>Loading contact details...</p>
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

            {user && (
              <div className="contact-sub-cta">
                <h4>Want to submit a full article?</h4>
                <p>You can draft, format, upload images, and submit your story directly for review through our submission portal.</p>
                <Link href="/submit" className="btn-cta-primary" style={{ display: 'inline-block', marginTop: '10px' }}>
                  Go to Story Submission
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="site-page-card contact-form-card">
            <h2 className="prose-h2" style={{ marginTop: 0 }}>Send a Message or News Tip</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
              Fill in the form below and our editorial moderation team will receive your inquiry immediately.
            </p>

            {formSuccess && (
              <div className="contact-alert success">
                <span style={{ fontSize: '1.4rem' }}>🌺</span>
                <div>
                  <strong>Fakaue lahi! (Thank you!)</strong>
                  <p>Your message has been sent to our editorial desk. We appreciate your contribution to Niue News.</p>
                </div>
              </div>
            )}

            {formError && (
              <div className="contact-alert error">
                <span>⚠️</span>
                <div>{formError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="senderName">Your Name *</label>
                <input
                  id="senderName"
                  type="text"
                  required
                  placeholder="e.g. Sione Talagi"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="contact-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="senderEmail">Email Address *</label>
                <input
                  id="senderEmail"
                  type="email"
                  required
                  placeholder="sione@example.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="contact-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject / Inquiry Type</label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="contact-select"
                >
                  <option value="News Tip">⚡ Breaking News Tip / Story Idea</option>
                  <option value="Community Notice">📢 Community Notice / Event</option>
                  <option value="Editorial Correction">📝 Correction / Clarification</option>
                  <option value="General Inquiry">💬 General Inquiry</option>
                  <option value="Partnership & Advertising">🤝 Partnership & Sponsorship</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message or Tip Details *</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Share details, names, locations, or context regarding your news tip or enquiry..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="contact-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-submit-contact"
              >
                {sending ? 'Sending Message...' : 'Send Message to Editorial Desk'}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
