'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  DEFAULT_PAGES, 
  DEFAULT_SOCIAL_LINKS, 
  SitePageContent, 
  SocialLinksContent,
  formatContentToParagraphs 
} from '@/lib/siteContent';
import Link from 'next/link';

type TabType = 'about' | 'contact' | 'privacy' | 'terms' | 'data_deletion' | 'social_links';

function AdminPagesManager() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const tabFromUrl = searchParams.get('tab') as TabType;
  const [selectedTab, setSelectedTab] = useState<TabType | null>(null);
  
  const validTabs: TabType[] = ['about', 'contact', 'privacy', 'terms', 'data_deletion', 'social_links'];
  const activeTab: TabType = selectedTab || (validTabs.includes(tabFromUrl) ? tabFromUrl : 'about');
  
  // Page states
  const [pageData, setPageData] = useState<Record<string, SitePageContent>>(DEFAULT_PAGES);
  const [socialData, setSocialData] = useState<SocialLinksContent>(DEFAULT_SOCIAL_LINKS);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load existing data from API or Firestore
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/site-pages');
        const json = await res.json();
        if (json.pages) {
          const mergedPages: Record<string, SitePageContent> = { ...DEFAULT_PAGES };
          ['about', 'contact', 'privacy', 'terms', 'data_deletion'].forEach(key => {
            if (json.pages[key]) {
              mergedPages[key] = {
                ...DEFAULT_PAGES[key],
                ...json.pages[key]
              };
            }
          });
          setPageData(mergedPages);

          if (json.pages.social_links) {
            setSocialData({
              ...DEFAULT_SOCIAL_LINKS,
              ...json.pages.social_links
            });
          }
        }
      } catch (err) {
        console.error('Failed to load site pages via API, using defaults:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handlePageFieldChange = (field: keyof SitePageContent, value: string) => {
    setPageData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value
      }
    }));
  };

  const handleSocialFieldChange = (field: keyof SocialLinksContent, value: string) => {
    setSocialData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      const token = await user.getIdToken();
      const payload = activeTab === 'social_links' 
        ? { pageId: 'social_links', data: socialData }
        : { pageId: activeTab, data: pageData[activeTab] };

      const res = await fetch('/api/admin/site-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'Failed to save page changes.');
      }

      setMessage({
        type: 'success',
        text: `Success! ${activeTab === 'social_links' ? 'Social links & footer' : activeTab.toUpperCase()} content updated and live.`
      });

      setTimeout(() => setMessage(null), 5000);
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({
        type: 'error',
        text: `Error saving: ${error.message}`
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefault = () => {
    if (activeTab === 'social_links') {
      if (confirm('Are you sure you want to restore default social links and footer settings?')) {
        setSocialData(DEFAULT_SOCIAL_LINKS);
        setMessage({ type: 'success', text: 'Restored default social media links. Click Save Changes to publish.' });
      }
    } else {
      if (confirm(`Are you sure you want to restore the original default template for ${activeTab.toUpperCase()}?`)) {
        setPageData(prev => ({
          ...prev,
          [activeTab]: DEFAULT_PAGES[activeTab]
        }));
        setMessage({ type: 'success', text: `Restored default template for ${activeTab}. Click Save Changes to publish.` });
      }
    }
  };

  const currentContent = activeTab !== 'social_links' ? pageData[activeTab] : null;
  const parsedPreviewBlocks = currentContent ? formatContentToParagraphs(currentContent.content) : [];

  const tabLabels: Record<TabType, { label: string; icon: string; publicPath: string | null }> = {
    about: { label: 'About Us', icon: 'ℹ️', publicPath: '/about' },
    contact: { label: 'Contact & Tips', icon: '📬', publicPath: '/contact' },
    privacy: { label: 'Privacy Policy', icon: '🔒', publicPath: '/privacy' },
    terms: { label: 'Terms of Service', icon: '📜', publicPath: '/terms' },
    data_deletion: { label: 'Data Deletion', icon: '🗑️', publicPath: '/data-deletion' },
    social_links: { label: 'Social & Footer', icon: '🌐', publicPath: null }
  };

  return (
    <div className="admin-pages-wrapper">
      <div className="admin-pages-header">
        <div>
          <h2 style={{ color: '#002B7F', margin: 0 }}>Site Pages & Footer Manager</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
            Manage public website pages (About, Contact, Privacy, Terms) and social media links.
          </p>
        </div>
        {tabLabels[activeTab].publicPath && (
          <Link 
            href={tabLabels[activeTab].publicPath!} 
            target="_blank"
            className="btn-view-live-page"
          >
            <span>👁️</span> View Live {tabLabels[activeTab].label} ↗
          </Link>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="admin-tabs-bar">
        {(Object.keys(tabLabels) as TabType[]).map(tab => (
          <button
            key={tab}
            type="button"
            className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => {
              setSelectedTab(tab);
              setMessage(null);
            }}
          >
            <span>{tabLabels[tab].icon}</span>
            <span>{tabLabels[tab].label}</span>
          </button>
        ))}
      </div>

      {/* Alerts */}
      {message && (
        <div className={`admin-msg-banner ${message.type}`}>
          <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
          <p>Loading page content...</p>
        </div>
      ) : (
        <div className="admin-page-editor-card">
          
          {/* CONTENT FOR ABOUT, PRIVACY, TERMS */}
          {activeTab !== 'social_links' && currentContent && (
            <div>
              <div className="admin-form-row">
                <div className="admin-field-group">
                  <label>Page Title</label>
                  <input
                    type="text"
                    value={currentContent.title}
                    onChange={(e) => handlePageFieldChange('title', e.target.value)}
                    className="admin-input"
                    placeholder="Page Title"
                  />
                </div>
                <div className="admin-field-group">
                  <label>Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={currentContent.subtitle}
                    onChange={(e) => handlePageFieldChange('subtitle', e.target.value)}
                    className="admin-input"
                    placeholder="Brief description or subtitle"
                  />
                </div>
              </div>

              {/* Specific fields for Contact page */}
              {activeTab === 'contact' && (
                <div className="contact-specific-fields">
                  <h4 style={{ color: '#002B7F', marginBottom: '12px' }}>Contact Details & Desk Channels</h4>
                  <div className="admin-form-grid-3">
                    <div className="admin-field-group">
                      <label>General Email</label>
                      <input
                        type="email"
                        value={currentContent.email || ''}
                        onChange={(e) => handlePageFieldChange('email', e.target.value)}
                        className="admin-input"
                        placeholder="contact@niuenews.nu"
                      />
                    </div>
                    <div className="admin-field-group">
                      <label>News Tips Email</label>
                      <input
                        type="email"
                        value={currentContent.newsTipsEmail || ''}
                        onChange={(e) => handlePageFieldChange('newsTipsEmail', e.target.value)}
                        className="admin-input"
                        placeholder="tips@niuenews.nu"
                      />
                    </div>
                    <div className="admin-field-group">
                      <label>Phone / Office Hotline</label>
                      <input
                        type="text"
                        value={currentContent.phone || ''}
                        onChange={(e) => handlePageFieldChange('phone', e.target.value)}
                        className="admin-input"
                        placeholder="+683 4000 (Alofi Office)"
                      />
                    </div>
                  </div>

                  <div className="admin-form-row" style={{ marginTop: '12px' }}>
                    <div className="admin-field-group">
                      <label>Physical Office Address</label>
                      <input
                        type="text"
                        value={currentContent.address || ''}
                        onChange={(e) => handlePageFieldChange('address', e.target.value)}
                        className="admin-input"
                        placeholder="Commercial Centre, Alofi South, Niue Island"
                      />
                    </div>
                    <div className="admin-field-group">
                      <label>Office Hours</label>
                      <input
                        type="text"
                        value={currentContent.officeHours || ''}
                        onChange={(e) => handlePageFieldChange('officeHours', e.target.value)}
                        className="admin-input"
                        placeholder="Monday – Friday: 8:00 AM – 4:00 PM (Niue Time, UTC-11)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content Area */}
              <div className="admin-field-group" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ margin: 0 }}>
                    Page Content & Sections (Markdown-friendly)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="btn-toggle-preview"
                  >
                    {showPreview ? '✏️ Edit Raw Text' : '👁️ Preview Formatted Layout'}
                  </button>
                </div>

                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 10px 0' }}>
                  Tip: Use <code>### Subheading</code> for subheadings, <code>- List item</code> for bullet points, and blank lines between paragraphs.
                </p>

                {showPreview ? (
                  <div className="admin-preview-box">
                    <h2 style={{ color: '#002B7F', marginTop: 0 }}>{currentContent.title}</h2>
                    {currentContent.subtitle && (
                      <p style={{ color: '#64748b', fontStyle: 'italic', marginBottom: '16px' }}>{currentContent.subtitle}</p>
                    )}
                    {parsedPreviewBlocks.map((block, idx) => {
                      if (block.type === 'heading') return <h2 key={idx} className="prose-h2">{block.content}</h2>;
                      if (block.type === 'subheading') return <h3 key={idx} className="prose-h3">{block.content}</h3>;
                      if (block.type === 'list') {
                        return (
                          <ul key={idx} className="prose-ul">
                            {block.items?.map((item, itemIdx) => <li key={itemIdx}>{item}</li>)}
                          </ul>
                        );
                      }
                      return <p key={idx} className="prose-p">{block.content}</p>;
                    })}
                  </div>
                ) : (
                  <textarea
                    rows={16}
                    value={currentContent.content}
                    onChange={(e) => handlePageFieldChange('content', e.target.value)}
                    className="admin-textarea"
                    placeholder="Enter page text..."
                  />
                )}
              </div>
            </div>
          )}

          {/* CONTENT FOR SOCIAL LINKS & FOOTER */}
          {activeTab === 'social_links' && (
            <div>
              <h4 style={{ color: '#002B7F', marginBottom: '6px' }}>Official Social Media Channels</h4>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                These links are displayed in the footer across all website pages.
              </p>

              <div className="admin-form-row">
                <div className="admin-field-group">
                  <label>
                    <span style={{ color: '#1877F2', fontWeight: 'bold' }}>Facebook</span> Page URL
                  </label>
                  <input
                    type="url"
                    value={socialData.facebook}
                    onChange={(e) => handleSocialFieldChange('facebook', e.target.value)}
                    className="admin-input"
                    placeholder="https://www.facebook.com/1358660107330903"
                  />
                </div>
                <div className="admin-field-group">
                  <label>
                    <span style={{ color: '#000000', fontWeight: 'bold' }}>X (Twitter)</span> URL
                  </label>
                  <input
                    type="url"
                    value={socialData.x}
                    onChange={(e) => handleSocialFieldChange('x', e.target.value)}
                    className="admin-input"
                    placeholder="https://x.com/niuenews"
                  />
                </div>
              </div>

              <div className="admin-form-row" style={{ marginTop: '12px' }}>
                <div className="admin-field-group">
                  <label>
                    <span style={{ color: '#E4405F', fontWeight: 'bold' }}>Instagram</span> URL
                  </label>
                  <input
                    type="url"
                    value={socialData.instagram}
                    onChange={(e) => handleSocialFieldChange('instagram', e.target.value)}
                    className="admin-input"
                    placeholder="https://www.instagram.com/niuenews"
                  />
                </div>
                <div className="admin-field-group">
                  <label>
                    <span style={{ color: '#FF0000', fontWeight: 'bold' }}>YouTube</span> Channel URL
                  </label>
                  <input
                    type="url"
                    value={socialData.youtube}
                    onChange={(e) => handleSocialFieldChange('youtube', e.target.value)}
                    className="admin-input"
                    placeholder="https://www.youtube.com/@niuenews"
                  />
                </div>
              </div>

              <div className="admin-field-group" style={{ marginTop: '16px' }}>
                <label>Footer Brand Tagline</label>
                <input
                  type="text"
                  value={socialData.footerTagline}
                  onChange={(e) => handleSocialFieldChange('footerTagline', e.target.value)}
                  className="admin-input"
                  placeholder="Ko e Motu Fakahelehele — Connecting Niue and our global diaspora..."
                />
              </div>

              <div className="admin-field-group" style={{ marginTop: '12px' }}>
                <label>Footer Short About Summary</label>
                <textarea
                  rows={3}
                  value={socialData.aboutSummary}
                  onChange={(e) => handleSocialFieldChange('aboutSummary', e.target.value)}
                  className="admin-textarea"
                  placeholder="Niue News is the premier community news hub..."
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="admin-actions-bar">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-admin-save"
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>

            <button
              type="button"
              onClick={handleRestoreDefault}
              disabled={saving}
              className="btn-admin-restore"
            >
              🔄 Restore Default Template
            </button>

            {tabLabels[activeTab].publicPath && (
              <Link 
                href={tabLabels[activeTab].publicPath!} 
                target="_blank"
                className="btn-admin-preview-link"
              >
                View Live Page ↗
              </Link>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default function AdminPagesPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
      <Suspense fallback={<div>Loading Page Manager...</div>}>
        <AdminPagesManager />
      </Suspense>
    </ProtectedRoute>
  );
}
