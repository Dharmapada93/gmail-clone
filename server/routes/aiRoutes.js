const express = require('express');
const router = express.Router();
const { generateSmartReply, enhanceText, generateTheme } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/smart-reply', protect, generateSmartReply);
router.post('/enhance', protect, enhanceText);
router.post('/generate-theme', protect, generateTheme);

module.exports = router;
