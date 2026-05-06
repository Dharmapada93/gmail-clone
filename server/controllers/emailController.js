const Email = require('../models/Email');
const User = require('../models/User');

// @desc    Send a new email
// @route   POST /api/emails
const sendEmail = async (req, res) => {
  try {
    const { receiver, subject, body, scheduledAt, isScheduled, threadId } = req.body;
    
    // Process attachments if any
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype
    })) : [];

    const newEmail = new Email({
      sender: req.user._id,
      receiver,
      subject,
      body,
      attachments,
      scheduledAt: isScheduled ? new Date(scheduledAt) : null,
      isScheduled: isScheduled === 'true' || isScheduled === true,
      threadId: threadId || null,
      labels: {
        inbox: !req.body.isSpam, // Will go to receiver's inbox if not spam
        sent: true,  // Will go to sender's sent
        draft: false,
        spam: req.body.isSpam || false,
        trash: false
      }
    });

    const savedEmail = await newEmail.save();

    // Populate sender info for real-time notification
    const populatedEmail = await Email.findById(savedEmail._id).populate('sender', 'name email profilePicture');

    // Real-time update to receiver
    if (!newEmail.isScheduled) {
      // Find receiver user to get their socket room
      const receiverUser = await User.findOne({ email: receiver });
      if (receiverUser) {
        req.io.to(receiverUser._id.toString()).emit('receive_email', populatedEmail);
      }
    }

    res.status(201).json(populatedEmail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get emails by label (inbox, sent, draft, trash, spam)
// @route   GET /api/emails/folder/:label
const getEmails = async (req, res) => {
  try {
    const { label } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    if (label === 'sent') {
      query = { sender: req.user._id, 'labels.sent': true, 'labels.trash': false };
    } else {
      // For inbox, spam, trash, draft (receiver view)
      query = { receiver: req.user.email, [`labels.${label}`]: true };
      
      // If inbox, ensure it's not in trash or spam
      if (label === 'inbox') {
        query['labels.trash'] = false;
        query['labels.spam'] = false;
      }
    }

    const emails = await Email.find(query)
      .populate('sender', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Email.countDocuments(query);

    res.json({
      emails,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update email status or labels (e.g. mark as read, move to trash)
// @route   PUT /api/emails/:id
const updateEmail = async (req, res) => {
  try {
    const { status, labels } = req.body;
    
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Authorization check - only sender or receiver can modify
    if (email.sender.toString() !== req.user._id.toString() && email.receiver !== req.user.email) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (status) email.status = status;
    if (labels) {
      email.labels = { ...email.labels, ...labels };
    }

    const updatedEmail = await email.save();
    res.json(updatedEmail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an email permanently
// @route   DELETE /api/emails/:id
const deleteEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    if (email.sender.toString() !== req.user._id.toString() && email.receiver !== req.user.email) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await email.deleteOne();
    res.json({ message: 'Email removed permanently' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendEmail, getEmails, updateEmail, deleteEmail };
