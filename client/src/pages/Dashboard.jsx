import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { receiptApi } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, receiptsRes] = await Promise.all([
          receiptApi.getStats(),
          receiptApi.getAll({ limit: 5, page: 1 })
        ]);
        setStats(statsRes.data.stats);
        setRecentReceipts(receiptsRes.data.receipts);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const modeLabel = { 'रोख': '💵 रोख', 'ऑनलाईन ट्रान्सफर': '📱 ऑनलाईन', 'धनादेश': '🏦 धनादेश' };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">📊 डॅशबोर्ड</div>
          <div className="page-subtitle">समर्थ मित्र मंडळ — नवरात्री उत्सव २०२५</div>
        </div>
        <Link to="/new-receipt" className="btn btn-primary">
          ➕ नवीन पावती
        </Link>
      </div>
      <div className="page-body">
        {loading ? (
          <div className="spinner-wrapper"><div className="spinner"></div></div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon gold">📄</div>
                <div className="stat-info">
                  <div className="stat-value">{stats?.totalReceipts || 0}</div>
                  <div className="stat-label">एकूण पावत्या</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon crimson">💰</div>
                <div className="stat-info">
                  <div className="stat-value">{formatCurrency(stats?.totalAmount)}</div>
                  <div className="stat-label">एकूण वर्गणी रक्कम</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon saffron">📅</div>
                <div className="stat-info">
                  <div className="stat-value">{stats?.todayReceipts || 0}</div>
                  <div className="stat-label">आजच्या पावत्या</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">📲</div>
                <div className="stat-info">
                  <div className="stat-value">{stats?.whatsappSent || 0}</div>
                  <div className="stat-label">WhatsApp पाठवले</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Recent Receipts */}
              <div className="card" style={{ gridColumn: '1 / -1' }}>
                <div className="card-title">📋 अलीकडील पावत्या</div>
                {recentReceipts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📄</div>
                    <div className="empty-state-text">अजून कोणतीही पावती नाही</div>
                    <Link to="/new-receipt" className="btn btn-primary" style={{ marginTop: 16 }}>नवीन पावती तयार करा</Link>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>पावती क्र.</th>
                          <th>नाव</th>
                          <th>रक्कम</th>
                          <th>प्रकार</th>
                          <th>दिनांक</th>
                          <th>WhatsApp</th>
                          <th>क्रिया</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentReceipts.map(r => (
                          <tr key={r._id}>
                            <td><span className="receipt-number-tag">{r.receiptNumber}</span></td>
                            <td style={{ fontWeight: 600, color: '#FFD700' }}>{r.donorName}</td>
                            <td style={{ color: '#4CAF50', fontWeight: 700 }}>₹{r.amount.toLocaleString('en-IN')}</td>
                            <td>{modeLabel[r.donationMode] || r.donationMode}</td>
                            <td>{formatDate(r.donationDate)}</td>
                            <td>
                              {r.whatsappSent
                                ? <span className="badge badge-success">✅ पाठवले</span>
                                : <span className="badge badge-warning">⏳ बाकी</span>}
                            </td>
                            <td>
                              <a href={receiptApi.downloadUrl(r._id)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">⬇️ PDF</a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {recentReceipts.length > 0 && (
                  <div style={{ marginTop: 16, textAlign: 'right' }}>
                    <Link to="/receipts" className="btn btn-outline btn-sm">सर्व पावत्या पहा →</Link>
                  </div>
                )}
              </div>

              {/* Mode Breakdown */}
              {stats?.modeBreakdown?.length > 0 && (
                <div className="card">
                  <div className="card-title">📊 देणगी प्रकार</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {stats.modeBreakdown.map(m => (
                      <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: '#FFD700', fontWeight: 600, fontFamily: 'Noto Sans Devanagari, serif' }}>{modeLabel[m._id] || m._id}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.count} पावत्या</div>
                        </div>
                        <div style={{ color: '#4CAF50', fontWeight: 700 }}>{formatCurrency(m.total)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
