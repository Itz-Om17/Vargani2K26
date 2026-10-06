import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { donorApi } from '../api';

export default function Donors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', village: '' });
  const [saving, setSaving] = useState(false);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const res = await donorApi.getAll(search);
      setDonors(res.data.donors || []);
    } catch {
      toast.error('वर्गणीदार लोड अयशस्वी');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonors(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  const openAdd = () => {
    setEditingDonor(null);
    setForm({ name: '', phone: '', address: '', village: '' });
    setShowForm(true);
  };

  const openEdit = (donor) => {
    setEditingDonor(donor);
    setForm({ name: donor.name, phone: donor.phone, address: donor.address || '', village: donor.village || '' });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return toast.error('नाव आणि नंबर आवश्यक');
    setSaving(true);
    try {
      if (editingDonor) {
        await donorApi.update(editingDonor._id, form);
        toast.success('✅ वर्गणीदार अपडेट केला');
      } else {
        await donorApi.create(form);
        toast.success('✅ नवीन वर्गणीदार जोडला');
      }
      setShowForm(false);
      fetchDonors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'सेव्ह अयशस्वी');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" हा वर्गणीदार खरोखर हटवायचा?`)) return;
    try {
      await donorApi.delete(id);
      toast.success('🗑️ वर्गणीदार हटवला');
      fetchDonors();
    } catch {
      toast.error('हटवणे अयशस्वी');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">👥 वर्गणीदार</div>
          <div className="page-subtitle">नोंदणीकृत वर्गणीदारांची यादी</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              style={{ width: 200 }}
              placeholder="🔍 नाव / नंबर शोधा..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-outline btn-sm">शोधा</button>
          </form>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>➕ नवीन</button>
        </div>
      </div>
      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="spinner-wrapper"><div className="spinner"></div></div>
          ) : donors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-text">
                {search ? `"${search}" साठी कोणीही सापडले नाही` : 'अजून कोणताही वर्गणीदार नोंदणीकृत नाही'}
              </div>
              {!search && (
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>नवीन वर्गणीदार जोडा</button>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>नाव</th>
                    <th>मोबाईल नंबर</th>
                    <th>पत्ता</th>
                    <th>गाव / शहर</th>
                    <th>क्रिया</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((d, i) => (
                    <tr key={d._id}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: '#FFD700' }}>{d.name}</td>
                      <td>{d.phone}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{d.address || '—'}</td>
                      <td style={{ fontSize: 12 }}>{d.village || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(d)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id, d.name)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add / Edit Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
            <div className="modal">
              <div className="modal-title">
                {editingDonor ? '✏️ वर्गणीदार संपादित करा' : '➕ नवीन वर्गणीदार'}
              </div>
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">नाव <span className="required">*</span></label>
                    <input className="form-input" placeholder="संपूर्ण नाव" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">मोबाईल नंबर <span className="required">*</span></label>
                    <input className="form-input" type="tel" placeholder="10 अंकी नंबर" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} maxLength={10} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">पत्ता</label>
                    <input className="form-input" placeholder="घर क्र., रस्ता..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">गाव / शहर</label>
                    <input className="form-input" placeholder="गाव किंवा शहर" value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))} />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>रद्द करा</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? '⏳ सेव्ह होत आहे...' : '✅ सेव्ह करा'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
