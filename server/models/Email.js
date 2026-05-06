const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: String, required: true },
  subject: { type: String, default: '' },
  body: { type: String, default: '' },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String
  }],
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  labels: { 
    inbox: { type: Boolean, default: true },
    sent: { type: Boolean, default: false },
    draft: { type: Boolean, default: false },
    spam: { type: Boolean, default: false },
    trash: { type: Boolean, default: false }
  },
  scheduledAt: { type: Date, default: null },
  isScheduled: { type: Boolean, default: false },
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Email' },
}, { timestamps: true });

// Add Indexes for Heavy Workload Optimization
emailSchema.index({ receiver: 1, status: 1 });
emailSchema.index({ sender: 1 });
emailSchema.index({ 'labels.inbox': 1, 'labels.sent': 1, 'labels.trash': 1, 'labels.spam': 1 });
emailSchema.index({ subject: 'text', body: 'text' }); // Text index for fast searching

module.exports = mongoose.model('Email', emailSchema);
