import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { receiptApi } from '../api';

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sendingIds, setSendingIds] = useState(new Set());

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await receiptApi.getAll({ page, limit: 15, search: search || undefined });
      setReceipts(res.data.receipts);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('पावत्या लोड करणे अयशस्वी');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReceipts(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReceipts();
  };

  const handleSendWhatsApp = async (id) => {
    setSendingIds(prev => new Set(prev).add(id));
    try {
      await receiptApi.sendWhatsApp(id);
      toast.success('📲 WhatsApp वर पाठवले!');
      fetchReceipts();
    } catch (err) {
      const reason = err.response?.data?.reason;
      if (typeof reason === 'string' && reason.includes('not configured')) {
        toast.error('⚠️ WhatsApp Token सेट नाही');
      } else {
        toast.error(reason || 'WhatsApp पाठवणे अयशस्वी', { duration: 5000 });
      }
    } finally {
      setSendingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const modeLabel = { 'रोख': '💵 रोख', 'ऑनलाईन ट्रान्सफर': '📱 ऑनलाईन', 'धनादेश': '🏦 धनादेश' };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">📄 सर्व पावत्या</div>
          <div className="page-subtitle">तयार केलेल्या सर्व वर्गणी पावत्या</div>
        </div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            className="form-input"
            style={{ width: 240 }}
            placeholder="🔍 नाव, क्र. किंवा फोन शोधा..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-outline btn-sm">शोधा</button>
          {search && <button type="button" className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setPage(1); setTimeout(fetchReceipts, 0); }}>✕</button>}
        </form>
      </div>
      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="spinner-wrapper"><div className="spinner"></div></div>
          ) : receipts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-text">
                {search ? `"${search}" साठी कोणतीही पावती सापडली नाही` : 'अजून कोणतीही पावती नाही'}
              </div>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>पावती क्र.</th>
                      <th>नाव</th>
                      <th>संपर्क</th>
                      <th>रक्कम</th>
                      <th>प्रकार</th>
                      <th>दिनांक</th>
                      <th>WhatsApp</th>
                      <th>क्रिया</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map(r => (
                      <tr key={r._id}>
                        <td><span className="receipt-number-tag">{r.receiptNumber}</span></td>
                        <td style={{ fontWeight: 600, color: '#FFD700' }}>{r.donorName}</td>
                        <td style={{ fontSize: 12 }}>{r.donorPhone}</td>
                        <td style={{ color: '#4CAF50', fontWeight: 700 }}>₹{r.amount.toLocaleString('en-IN')}</td>
                        <td>{modeLabel[r.donationMode] || r.donationMode}</td>
                        <td>{formatDate(r.donationDate)}</td>
                        <td>
                          {r.whatsappSent
                            ? <span className="badge badge-success">✅ पाठवले</span>
                            : <span className="badge badge-warning">⏳ बाकी</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <a href={receiptApi.viewUrl(r._id)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" title="पावती पहा आणि प्रिंट करा">👁️</a>
                            <a href={receiptApi.downloadUrl(r._id)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" title="PDF डाउनलोड करा">⬇️</a>
                            {!r.whatsappSent && (
                              <button
                                className="btn btn-whatsapp btn-sm"
                                onClick={() => handleSendWhatsApp(r._id)}
                                disabled={sendingIds.has(r._id)}
                                title="WhatsApp वर पाठवा"
                              >
                                {sendingIds.has(r._id) ? '📤' : '📲'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                  <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← मागील</button>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Noto Sans Devanagari, serif' }}>
                    पान {page} / {totalPages}
                  </span>
                  <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>पुढील →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
