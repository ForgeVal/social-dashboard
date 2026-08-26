import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';

function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: wsData } = useWebSocket();

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!wsData) return;
    if (wsData.type === 'metrics_update') {
      setMetrics(prev => prev.map(m => m._id === wsData.data._id ? wsData.data : m));
    }
  }, [wsData]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics');
      const data = await res.json();
      setMetrics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) return <main><h1 className="page-title">Dashboard</h1>Loading...</main>;

  return (
    <main>
      <h1 className="page-title">Social Media Dashboard</h1>
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <div key={metric._id} className="card">
            <div style={{fontSize: '13px', color: 'var(--text-light)', fontWeight: '600', marginBottom: '8px'}}>
              {metric.platform}
            </div>
            <div className="metric-value">{metric.followers?.toLocaleString()}</div>
            <div style={{fontSize: '13px', color: 'var(--text-light)', marginTop: '16px'}}>Followers</div>
            <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <div>
                <div style={{fontSize: '12px', color: 'var(--text-light)'}}>Engagement</div>
                <div style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)'}}>{metric.engagement}%</div>
              </div>
              <div>
                <div style={{fontSize: '12px', color: 'var(--text-light)'}}>Reach</div>
                <div style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)'}}>{metric.reach?.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Dashboard;
