"use client";

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a valid website or product URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze the URL. Please try again.");
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert markdown to simple HTML for rendering the result
  const renderResult = (text: string) => {
    const lines = text.split('\n');
    let inList = false;
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        elements.push(<h2 key={index}>{trimmed.substring(3)}</h2>);
      } else if (trimmed.startsWith('### ')) {
        elements.push(<h3 key={index}>{trimmed.substring(4)}</h3>);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(<li key={index}>{trimmed.substring(2)}</li>);
      } else if (trimmed !== '') {
        elements.push(<p key={index} style={{ marginBottom: '10px' }}>{trimmed}</p>);
      }
    });

    return elements;
  };

  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Welcome to Tautala Niue News Hub</h1>
          <p>
            The global platform connecting writers, creators, and the Niuean community. 
            Submit a web link to auto-generate a news summary, action steps, and recommendations for our global community!
          </p>
          <div className="categories">
            <span className="category-tag">Community</span>
            <span className="category-tag">Health</span>
            <span className="category-tag">Education</span>
            <span className="category-tag">Politics</span>
            <span className="category-tag">Sports</span>
            <span className="category-tag">Entertainments</span>
            <span className="category-tag">Regional & Global</span>
          </div>
        </div>
      </section>

      <section className="app-section">
        <div className="container">
          <div className="app-card">
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="urlInput">Enter a Website or Product URL to Analyze</label>
                <div className="input-wrapper">
                  <input
                    type="url"
                    id="urlInput"
                    placeholder="https://example.com/some-news-or-product"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isLoading}
                  />
                  <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Analyzing...' : 'Generate Impact Steps'}
                  </button>
                </div>
              </div>
            </form>

            {isLoading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>Analyzing link and generating Niuean community impact steps...</p>
              </div>
            )}

            {result && !isLoading && (
              <div className="results-area">
                <div className="result-card">
                  <h2>Generated Action Steps & Recommendations</h2>
                  <div className="result-content">
                    {renderResult(result)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
