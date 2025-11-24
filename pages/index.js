import { useMemo, useState } from 'react';
import Head from 'next/head';
import { generateAll, composeMarkdown } from '../lib/agent';

export default function Home() {
  const [form, setForm] = useState({
    niche: 'Coaching',
    idealCustomer: 'Busy founders',
    product: 'Marketing strategy + content engine',
    primaryGoal: 'More qualified leads',
    voice: 'Clear & Actionable',
    pricePoint: 'Mid',
    channels: ['LinkedIn', 'Twitter', 'Email'],
    competitors: '',
    differentiator: 'Simple frameworks that ship weekly results',
  });

  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('inputs');
  const [isGenerating, setIsGenerating] = useState(false);

  const markdown = useMemo(() => result ? composeMarkdown(result.inputs, result) : '', [result]);

  function toggleChannel(channel) {
    const current = Array.isArray(form.channels) ? form.channels : [];
    const next = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel];
    setForm((f) => ({ ...f, channels: next }));
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onGenerate(e) {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const out = generateAll(form);
      setResult(out);
      setActiveTab('plan');
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyMarkdown() {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    alert('Markdown copied to clipboard');
  }

  function downloadMarkdown() {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marketing-game-plan.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetAll() {
    setResult(null);
    setActiveTab('inputs');
  }

  const channelOptions = ['LinkedIn', 'Twitter', 'Instagram', 'YouTube', 'Email', 'Blog'];

  return (
    <>
      <Head>
        <title>Marketing Coach Agent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Generate content plans, pain points, desires, and offer ladders" />
      </Head>
      <main className="container">
        <header className="header">
          <h1>Marketing Coach Agent</h1>
          <p>Build content plans, customer insights, and irresistible offers.</p>
        </header>

        <section className="card">
          <form onSubmit={onGenerate}>
            <div className="grid">
              <label className="field">
                <span>Niche / Industry</span>
                <input name="niche" value={form.niche} onChange={onChange} placeholder="e.g., SaaS, Coaching, E-commerce" />
              </label>
              <label className="field">
                <span>Ideal Customer</span>
                <input name="idealCustomer" value={form.idealCustomer} onChange={onChange} placeholder="e.g., Series A SaaS founders" />
              </label>
              <label className="field">
                <span>Product / Service</span>
                <input name="product" value={form.product} onChange={onChange} placeholder="e.g., Done-with-you content engine" />
              </label>
              <label className="field">
                <span>Primary Goal</span>
                <input name="primaryGoal" value={form.primaryGoal} onChange={onChange} placeholder="e.g., More qualified leads" />
              </label>
              <label className="field">
                <span>Voice</span>
                <select name="voice" value={form.voice} onChange={onChange}>
                  <option>Clear & Actionable</option>
                  <option>Friendly & Encouraging</option>
                  <option>Bold & Contrarian</option>
                  <option>Professional & Data-Driven</option>
                </select>
              </label>
              <label className="field">
                <span>Price Point</span>
                <select name="pricePoint" value={form.pricePoint} onChange={onChange}>
                  <option>Low</option>
                  <option>Mid</option>
                  <option>High</option>
                </select>
              </label>
              <label className="field col-2">
                <span>Top Competitors (comma or newline separated)</span>
                <textarea name="competitors" value={form.competitors} onChange={onChange} rows={2} placeholder="Competitor A, Competitor B" />
              </label>
              <label className="field col-2">
                <span>Key Differentiator</span>
                <textarea name="differentiator" value={form.differentiator} onChange={onChange} rows={2} placeholder="What makes you unmistakably different" />
              </label>
            </div>

            <div className="channels">
              <div className="channels-title">Primary Channels</div>
              <div className="channels-list">
                {channelOptions.map((ch) => (
                  <label key={ch} className={`chip ${form.channels.includes(ch) ? 'active' : ''}`}>
                    <input type="checkbox" checked={form.channels.includes(ch)} onChange={() => toggleChannel(ch)} /> {ch}
                  </label>
                ))}
              </div>
            </div>

            <div className="actions">
              <button type="submit" className="btn primary" disabled={isGenerating}>{isGenerating ? 'Generating?' : 'Generate Plan'}</button>
              <button type="button" className="btn" onClick={resetAll}>Reset</button>
              <button type="button" className="btn" onClick={copyMarkdown} disabled={!result}>Copy Markdown</button>
              <button type="button" className="btn" onClick={downloadMarkdown} disabled={!result}>Download .md</button>
            </div>
          </form>
        </section>

        <nav className="tabs">
          {['inputs','profile','pains','desires','offers','plan','markdown'].map((tab) => (
            <button key={tab} className={`tab ${activeTab===tab?'active':''}`} onClick={() => setActiveTab(tab)}>{tab.toUpperCase()}</button>
          ))}
        </nav>

        <section className="card">
          {!result && activeTab !== 'inputs' && (
            <div className="empty">Generate a plan to see results.</div>
          )}

          {activeTab === 'inputs' && (
            <pre className="pre">
{JSON.stringify(form, null, 2)}
            </pre>
          )}

          {result && activeTab === 'profile' && (
            <div className="section">
              <h3>Customer Profile</h3>
              <p>{result.customerProfile.summary}</p>
              <div className="cols">
                <div>
                  <h4>Demographics</h4>
                  <ul>{result.customerProfile.demographics.map((d, i) => <li key={i}>{d}</li>)}</ul>
                </div>
                <div>
                  <h4>Psychographics</h4>
                  <ul>{result.customerProfile.psychographics.map((d, i) => <li key={i}>{d}</li>)}</ul>
                </div>
              </div>
            </div>
          )}

          {result && activeTab === 'pains' && (
            <div className="section">
              <h3>Pain Points</h3>
              {result.painPoints.map((p, i) => (
                <details key={i} open>
                  <summary>{p.category}</summary>
                  <ul>{p.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
                </details>
              ))}
            </div>
          )}

          {result && activeTab === 'desires' && (
            <div className="section">
              <h3>Dreams & Desires</h3>
              <ul>{result.dreamsDesires.map((d, i) => <li key={i}>{d}</li>)}</ul>
            </div>
          )}

          {result && activeTab === 'offers' && (
            <div className="section">
              <h3>Offer Ladder</h3>
              <div className="offer-grid">
                {result.offerLadder.map((o, i) => (
                  <div key={i} className="offer">
                    <div className="offer-head">
                      <div className="offer-name">{o.name}</div>
                      <div className="offer-price">{o.price}</div>
                    </div>
                    <div className="offer-promise">{o.promise}</div>
                    <ul className="offer-list">{o.components.map((c, j) => <li key={j}>{c}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && activeTab === 'plan' && (
            <div className="section">
              <h3>30-Day Content Plan</h3>
              <ol className="plan">
                {result.contentPlan.map((d) => (
                  <li key={d.day}>
                    <div className="plan-head">
                      <span className="badge">Day {d.day}</span>
                      <span className="plan-idea">{d.idea}</span>
                    </div>
                    <div className="plan-cta">CTA: {d.cta}</div>
                    <div className="repurpose">
                      {d.repurpose.map((r, i) => (
                        <span className="chip small" key={i}>{r.channel} ? {r.format}</span>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {result && activeTab === 'markdown' && (
            <div className="section">
              <h3>Markdown Export</h3>
              <textarea readOnly value={markdown} rows={24} className="mono" />
            </div>
          )}
        </section>

        <footer className="footer">Built for deployment on Vercel ? {new Date().getFullYear()}</footer>
      </main>
    </>
  );
}
