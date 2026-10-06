const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, unique: true, required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', default: null },
  donorName: { type: String, required: true },
  donorPhone: { type: String, required: true },
  donorAddress: { type: String, default: '' },
  donorVillage: { type: String, default: '' },
  amount: { type: Number, required: true },
  amountInWords: { type: String, default: '' },
  donationMode: { type: String, enum: ['रोख', 'ऑनलाईन ट्रान्सफर', 'धनादेश'], required: true },
  donationDate: { type: Date, required: true },
  whatsappSent: { type: Boolean, default: false },
  whatsappSentAt: { type: Date, default: null },
  pdfPath: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate receipt number before validation
receiptSchema.pre('validate', async function () {
  if (this.isNew && !this.receiptNumber) {
    const count = await mongoose.model('Receipt').countDocuments();
    const year = new Date().getFullYear();
    this.receiptNumber = `SMM-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Receipt', receiptSchema);
