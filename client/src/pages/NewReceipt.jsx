import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { donorApi, receiptApi } from '../api';

// Marathi number to words
function numberToMarathiWords(num) {
  const ones = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ',
    'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस',
    'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस',
    'तीस', 'एकतीस', 'बत्तीस', 'तेहेतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस',
    'चाळीस', 'एकेचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'सेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास',
    'पन्नास', 'एकावन्न', 'बावन्न', 'त्रेपन्न', 'चोपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ',
    'साठ', 'एकसष्ट', 'बासष्ट', 'त्रेसष्ट', 'चौसष्ट', 'पासष्ट', 'सहासष्ट', 'सदुसष्ट', 'अडुसष्ट', 'एकोणसत्तर',
    'सत्तर', 'एकाहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौर्‍याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्याहत्तर', 'अठ्याहत्तर', 'एकोणऐंशी',
    'ऐंशी', 'एक्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'च्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्याऐंशी', 'अठ्याऐंशी', 'एकोणनव्वद',
    'नव्वद', 'एक्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'च्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्याण्णव', 'अठ्याण्णव', 'नव्याण्णव'
  ];

  if (!num || num === 0) return '';
  let n = Number(num);
  let result = '';
  if (n >= 100000) { result += ones[Math.floor(n / 100000)] + ' लाख '; n %= 100000; }
  if (n >= 1000) { result += numberToMarathiWords100(Math.floor(n / 1000), ones) + ' हजार '; n %= 1000; }
  if (n >= 100) { result += ones[Math.floor(n / 100)] + ' शे '; n %= 100; }
  if (n > 0) result += ones[n] + ' ';
  return result.trim() + ' रुपये फक्त';
}

function numberToMarathiWords100(n, ones) {
  if (n < 100) {
    const ones2 = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ',
      'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस',
      'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस',
      'तीस', 'एकतीस', 'बत्तीस', 'तेहेतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस',
      'चाळीस', 'एकेचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'सेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास',
      'पन्नास', 'एकावन्न', 'बावन्न', 'त्रेपन्न', 'चोपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ',
      'साठ', 'एकसष्ट', 'बासष्ट', 'त्रेसष्ट', 'चौसष्ट', 'पासष्ट', 'सहासष्ट', 'सदुसष्ट', 'अडुसष्ट', 'एकोणसत्तर',
      'सत्तर', 'एकाहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौर्‍याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्याहत्तर', 'अठ्याहत्तर', 'एकोणऐंशी',
      'ऐंशी', 'एक्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'च्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्याऐंशी', 'अठ्याऐंशी', 'एकोणनव्वद',
      'नव्वद', 'एक्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'च्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्याण्णव', 'अठ्याण्णव', 'नव्याण्णव'
    ];
    return ones2[n] || '';
  }
  return ones[Math.floor(n / 100)] + ' शे ' + (ones[n % 100] || '');
}

const INITIAL_FORM = {
  donorId: '',
  donorName: '',
  donorPhone: '',
  donorAddress: '',
  donorVillage: '',
  amount: '',
  donationMode: 'रोख',
  donationDate: new Date().toISOString().split('T')[0]
};

export default function NewReceipt() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [createdReceipt, setCreatedReceipt] = useState(null);
  const [sendingWA, setSendingWA] = useState(false);
  const searchTimeout = useRef(null);
  const suggRef = useRef(null);

  // Search donors as user types name
  const handleNameChange = useCallback(async (val) => {
    setForm(f => ({ ...f, donorName: val, donorId: '' }));
    clearTimeout(searchTimeout.current);
    if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await donorApi.getAll(val);
        setSuggestions(res.data.donors || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
  }, []);

  const selectDonor = (donor) => {
    setForm(f => ({
      ...f,
      donorId: donor._id,
      donorName: donor.name,
      donorPhone: donor.phone,
      donorAddress: donor.address || '',
      donorVillage: donor.village || ''
    }));
    setShowSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => { if (suggRef.current && !suggRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.donorName.trim()) return toast.error('कृपया नाव भरा');
    if (!form.donorPhone.trim()) return toast.error('कृपया मोबाईल नंबर भरा');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('कृपया रक्कम भरा');

    setLoading(true);
    try {
      const res = await receiptApi.create(form);
      toast.success('🙏 पावती यशस्वीरित्या तयार झाली!');
      setCreatedReceipt(res.data.receipt);
    } catch (err) {
      toast.error(err.response?.data?.message || 'पावती तयार करणे अयशस्वी');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!createdReceipt) return;
    setSendingWA(true);
    try {
      await receiptApi.sendWhatsApp(createdReceipt._id);
      toast.success('📲 WhatsApp वर पाठवले!');
    } catch (err) {
      const reason = err.response?.data?.reason;
      if (typeof reason === 'string' && reason.includes('not configured')) {
        toast.error('⚠️ WhatsApp Token सेट केलेला नाही. .env फाईल तपासा.');
      } else {
        toast.error(reason || 'WhatsApp पाठवणे अयशस्वी', { duration: 5000 });
      }
    } finally {
      setSendingWA(false);
    }
  };

  const amountWords = numberToMarathiWords(form.amount);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">📝 नवीन पावती</div>
          <div className="page-subtitle">वर्गणी माहिती भरा आणि PDF तयार करा</div>
        </div>
      </div>
      <div className="page-body">
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="card">
            <div className="card-title">🙏 वर्गणीदाराची माहिती</div>
            <div className="form-grid">

              {/* Donor Name with search */}
              <div className="form-group" ref={suggRef}>
                <label className="form-label">
                  नाव <span className="required">*</span>
                </label>
                <div className="donor-search-wrapper">
                  <input
                    className="form-input"
                    placeholder="वर्गणीदाराचे नाव टाइप करा..."
                    value={form.donorName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    autoComplete="off"
                    required
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="donor-suggestions">
                      {suggestions.map(d => (
                        <div key={d._id} className="donor-suggestion-item" onMouseDown={() => selectDonor(d)}>
                          <span className="donor-suggestion-name">👤 {d.name}</span>
                          <span className="donor-suggestion-phone">📞 {d.phone} {d.village ? `• ${d.village}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {form.donorId && (
                  <div style={{ fontSize: 11, color: '#27AE60', marginTop: 4 }}>✅ नोंदणीकृत वर्गणीदार</div>
                )}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">मोबाईल नंबर <span className="required">*</span></label>
                <input
                  className="form-input"
                  type="tel"
                  name="donorPhone"
                  placeholder="10 अंकी मोबाईल नंबर"
                  value={form.donorPhone}
                  onChange={handleChange}
                  maxLength={10}
                  required
                />
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="form-label">पत्ता</label>
                <input
                  className="form-input"
                  type="text"
                  name="donorAddress"
                  placeholder="घर क्र., रस्ता..."
                  value={form.donorAddress}
                  onChange={handleChange}
                />
              </div>

              {/* Village */}
              <div className="form-group">
                <label className="form-label">गाव / शहर</label>
                <input
                  className="form-input"
                  type="text"
                  name="donorVillage"
                  placeholder="गाव किंवा शहर"
                  value={form.donorVillage}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-title">💰 देणगीची माहिती</div>
            <div className="form-grid">

              {/* Amount */}
              <div className="form-group">
                <label className="form-label">रक्कम (रुपये) <span className="required">*</span></label>
                <div className="amount-input-wrapper">
                  <span className="amount-prefix">₹</span>
                  <input
                    className="form-input"
                    type="number"
                    name="amount"
                    placeholder="0"
                    value={form.amount}
                    onChange={handleChange}
                    min={1}
                    required
                  />
                </div>
                {form.amount > 0 && (
                  <div className="amount-words-display">
                    {amountWords}
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label">दिनांक <span className="required">*</span></label>
                <input
                  className="form-input"
                  type="date"
                  name="donationDate"
                  value={form.donationDate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Mode */}
              <div className="form-group full">
                <label className="form-label">देणगीचा प्रकार <span className="required">*</span></label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {['रोख', 'ऑनलाईन ट्रान्सफर', 'धनादेश'].map(mode => (
                    <label key={mode} style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="donationMode"
                        value={mode}
                        checked={form.donationMode === mode}
                        onChange={handleChange}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        padding: '10px 20px',
                        borderRadius: 10,
                        border: `2px solid ${form.donationMode === mode ? 'var(--gold)' : 'var(--border)'}`,
                        background: form.donationMode === mode ? 'rgba(200,134,10,0.15)' : 'transparent',
                        color: form.donationMode === mode ? '#FFD700' : 'var(--text-muted)',
                        fontFamily: 'Noto Sans Devanagari, serif',
                        fontWeight: 600,
                        fontSize: 14,
                        transition: 'var(--transition)',
                        userSelect: 'none'
                      }}>
                        {mode === 'रोख' && '💵 '}{mode === 'ऑनलाईन ट्रान्सफर' && '📱 '}{mode === 'धनादेश' && '🏦 '}
                        {mode}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setForm(INITIAL_FORM)}>
                🔄 रीसेट
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? '⏳ PDF तयार होत आहे...' : '📄 पावती तयार करा'}
              </button>
            </div>
          </div>
        </form>

        {/* Success Modal */}
        {createdReceipt && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setCreatedReceipt(null)}>
            <div className="modal">
              <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 12 }}>🙏</div>
              <div className="modal-title">पावती यशस्वीरित्या तयार झाली!</div>

              <div style={{ background: 'rgba(200,134,10,0.08)', borderRadius: 10, padding: 16, marginBottom: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'Noto Sans Devanagari, serif' }}>पावती क्र.</span>
                  <span className="receipt-number-tag">{createdReceipt.receiptNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'Noto Sans Devanagari, serif' }}>नाव</span>
                  <span style={{ color: '#FFD700', fontWeight: 700 }}>{createdReceipt.donorName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'Noto Sans Devanagari, serif' }}>रक्कम</span>
                  <span style={{ color: '#4CAF50', fontWeight: 700 }}>₹{createdReceipt.amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="modal-actions">
                <a
                  href={receiptApi.viewUrl(createdReceipt._id)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  👁️ पावती पहा / प्रिंट
                </a>
                <a
                  href={receiptApi.downloadUrl(createdReceipt._id)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                >
                  ⬇️ PDF डाउनलोड करा
                </a>
                <button
                  className="btn btn-whatsapp"
                  onClick={handleSendWhatsApp}
                  disabled={sendingWA}
                >
                  {sendingWA ? '📤 पाठवत आहे...' : '📲 WhatsApp वर पाठवा'}
                </button>
                <button className="btn btn-outline" onClick={() => { setCreatedReceipt(null); setForm(INITIAL_FORM); }}>
                  ➕ नवीन पावती
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/receipts')}>
                  📋 सर्व पावत्या
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
