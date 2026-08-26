import React, { useState, useEffect } from 'react';

function AdminPanel() {
  const [metrics, setMetrics] = useState([]);
  const [form, setForm] = useState({
    platform: '',
    followers: '',
    engagement: '',
    reach: '',
    impressions: '',
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics');
      setMetrics(await res.json());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: form.platform,
          followers: parseInt(form.followers),
          engagement: parseInt(form.engagement),
          reach: parseInt(form.reach),
          impressions: parseInt(form.impressions),
        }),
      });
      if (response.ok) {
        setForm({ platform: '', followers: '', engagement: '', reach: '', impressions: '' });
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <main>
      <h1 className="page-title">Admin Panel</h1>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px'}}>
        <div className="card">
          <h2 style={{marginBottom: '20px', color: 'var(--text-dark)'}}>Add Metrics</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Platform</label>
              <input type="text" placeholder="Instagram" value={form.platform} onChange={(e) => setForm({...form, platform: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Followers</label>
              <input type="number" placeholder="0" value={form.followers} onChange={(e) => setForm({...form, followers: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Engagement %</label>
              <input type="number" step="0.1" placeholder="0" value={form.engagement} onChange={(e) => setForm({...form, engagement: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Reach</label>
              <input type="number" placeholder="0" value={form.reach} onChange={(e) => setForm({...form, reach: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Impressions</label>
              <input type="number" placeholder="0" value={form.impressions} onChange={(e) => setForm({...form, impressions: e.target.value})} />
            </div>
            <button type="submit" className="btn">Add Metrics</button>
          </form>
        </div>
        <div>
          <h2 style={{marginBottom: '20px', color: 'var(--text-dark)'}}>Current Metrics</h2>
          {metrics.map((m) => (
            <div key={m._id} className="card" style={{marginBottom: '12px', padding: '16px'}}>
              <div style={{fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px'}}>{m.platform}</div>
              <div style={{fontSize: '13px', color: 'var(--text-light)'}}>{m.followers?.toLocaleString()} followers • {m.engagement}% engagement</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default AdminPanel;
