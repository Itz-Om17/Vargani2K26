const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Receipt = require('../models/Receipt');
const Donor = require('../models/Donor');
const { generatePDF } = require('../utils/pdfGenerator');
const { sendReceiptOnWhatsApp } = require('../utils/whatsapp');

const os = require('os');
const { generateReceiptHTML, getLogoDataUri } = require('../utils/pdfGenerator');

const PDF_DIR = process.env.VERCEL 
  ? path.join(os.tmpdir(), 'vargani_pdfs') 
  : path.join(__dirname, '..', 'generated_pdfs');

// GET all receipts (with pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { donorName: { $regex: search, $options: 'i' } },
          { receiptNumber: { $regex: search, $options: 'i' } },
          { donorPhone: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const total = await Receipt.countDocuments(query);
    const receipts = await Receipt.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, receipts, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single receipt
router.get('/:id', async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    res.json({ success: true, receipt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create receipt + generate PDF
router.post('/', async (req, res) => {
  try {
    const { donorId, donorName, donorPhone, donorAddress, donorVillage, amount, donationMode, donationDate } = req.body;

    if (!donorName || !donorPhone || !amount || !donationMode || !donationDate) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    // If phone provided, auto-register donor if not exists
    let resolvedDonorId = donorId || null;
    if (!donorId && donorPhone) {
      let existingDonor = await Donor.findOne({ phone: donorPhone });
      if (!existingDonor) {
        existingDonor = await Donor.create({ name: donorName, phone: donorPhone, address: donorAddress, village: donorVillage });
      }
      resolvedDonorId = existingDonor._id;
    }

    const receipt = new Receipt({
      donorId: resolvedDonorId,
      donorName,
      donorPhone,
      donorAddress: donorAddress || '',
      donorVillage: donorVillage || '',
      amount: Number(amount),
      donationMode,
      donationDate: new Date(donationDate)
    });
    await receipt.save();

    // Safely generate PDF (non-fatal if browser engine unavailable)
    try {
      const { filePath } = await generatePDF(receipt, PDF_DIR);
      receipt.pdfPath = filePath;
      await receipt.save();
    } catch (pdfErr) {
      console.warn('PDF generation deferred (will use HTML view/print):', pdfErr.message);
    }

    res.status(201).json({
      success: true,
      receipt,
      pdfUrl: `/api/receipts/${receipt._id}/download`,
      viewUrl: `/api/receipts/${receipt._id}/view`,
      message: 'पावती तयार झाली!'
    });
  } catch (err) {
    console.error('Receipt creation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET HTML view / print receipt (works 100% on all devices and serverless)
router.get('/:id/view', async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).send('पावती सापडली नाही');
    }

    const logoDataUri = getLogoDataUri();
    let html = generateReceiptHTML(receipt, logoDataUri);

    const printScript = `
      <style>
        @media print {
          .no-print { display: none !important; }
          body { background: transparent !important; }
        }
        .action-bar {
          position: fixed;
          top: 14px;
          right: 14px;
          display: flex;
          gap: 10px;
          z-index: 99999;
          background: rgba(20, 20, 20, 0.88);
          backdrop-filter: blur(8px);
          padding: 8px 14px;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          border: 1px solid rgba(255, 215, 0, 0.3);
        }
        .action-btn {
          background: linear-gradient(135deg, #8B0000, #b22222);
          color: #fff;
          border: 1px solid #c8860a;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        .action-btn:hover {
          filter: brightness(1.2);
          transform: translateY(-1px);
        }
        .close-btn {
          background: #333;
          border: 1px solid #555;
        }
      </style>
      <div class="action-bar no-print">
        <button class="action-btn" onclick="window.print()">🖨️ प्रिंट / PDF सेव्ह करा</button>
        <button class="action-btn close-btn" onclick="window.close()">✕ बंद करा</button>
      </div>
      ${req.query.print === '1' ? '<script>window.addEventListener("load", () => { setTimeout(() => window.print(), 400); });</script>' : ''}
    `;

    html = html.replace('</body>', `${printScript}</body>`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(500).send('त्रुटी: ' + err.message);
  }
});

// GET download PDF
router.get('/:id/download', async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'पावती सापडली नाही' });
    }

    // If PDF file exists, stream it
    if (receipt.pdfPath && fs.existsSync(receipt.pdfPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="receipt_${receipt.receiptNumber}.pdf"`);
      return fs.createReadStream(receipt.pdfPath).pipe(res);
    }

    // Try regenerating PDF on-demand
    try {
      const { filePath } = await generatePDF(receipt, PDF_DIR);
      if (filePath && fs.existsSync(filePath)) {
        receipt.pdfPath = filePath;
        await receipt.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt_${receipt.receiptNumber}.pdf"`);
        return fs.createReadStream(filePath).pipe(res);
      }
    } catch (pdfErr) {
      console.warn('PDF generation unavailable, falling back to HTML view:', pdfErr.message);
    }

    // Fallback: Redirect to high-fidelity print/view page
    return res.redirect(`/api/receipts/${receipt._id}/view?print=1`);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST send receipt on WhatsApp
router.post('/:id/send-whatsapp', async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });

    // Ensure PDF exists
    if (!receipt.pdfPath || !fs.existsSync(receipt.pdfPath)) {
      try {
        const { filePath } = await generatePDF(receipt, PDF_DIR);
        receipt.pdfPath = filePath;
        await receipt.save();
      } catch (pdfErr) {
        console.warn('PDF generation for WhatsApp failed:', pdfErr.message);
      }
    }

    if (!receipt.pdfPath || !fs.existsSync(receipt.pdfPath)) {
      return res.status(400).json({
        success: false,
        reason: 'WhatsApp वर PDF पाठवण्यासाठी PDF उपलब्ध नाही. कृपया स्थानिक सर्व्हर वापरा किंवा PDF डाउनलोड करा.'
      });
    }

    const result = await sendReceiptOnWhatsApp(receipt.donorPhone, receipt, receipt.pdfPath);

    if (result.success) {
      receipt.whatsappSent = true;
      receipt.whatsappSentAt = new Date();
      await receipt.save();
      res.json({ success: true, message: `WhatsApp वर पाठवले: ${receipt.donorPhone}`, data: result.data });
    } else {
      res.status(500).json({ success: false, message: 'WhatsApp पाठवणे अयशस्वी', reason: result.reason });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET dashboard stats
router.get('/stats/overview', async (req, res) => {
  try {
    const totalReceipts = await Receipt.countDocuments();
    const totalAmount = await Receipt.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayReceipts = await Receipt.countDocuments({ createdAt: { $gte: todayStart } });
    const whatsappSent = await Receipt.countDocuments({ whatsappSent: true });
    const modeBreakdown = await Receipt.aggregate([
      { $group: { _id: '$donationMode', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);
    res.json({
      success: true,
      stats: {
        totalReceipts,
        totalAmount: totalAmount[0]?.total || 0,
        todayReceipts,
        whatsappSent,
        modeBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
