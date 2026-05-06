const express = require('express');
const router = express.Router();
const { sendEmail, getEmails, updateEmail, deleteEmail } = require('../controllers/emailController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const { aiSpamFilter } = require('../middlewares/spamFilter');

router.route('/')
  .post(protect, upload.array('attachments', 5), aiSpamFilter, sendEmail); // Max 5 attachments

router.route('/folder/:label')
  .get(protect, getEmails);

router.route('/:id')
  .put(protect, updateEmail)
  .delete(protect, deleteEmail);

module.exports = router;
