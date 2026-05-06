const cron = require('node-cron');
const Email = require('../models/Email');
const User = require('../models/User');

const startCronJobs = (io) => {
  // Run every minute to check for scheduled emails
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      const scheduledEmails = await Email.find({
        isScheduled: true,
        scheduledAt: { $lte: now }
      }).populate('sender', 'name email profilePicture');

      for (let email of scheduledEmails) {
        // Send email (mark as not scheduled)
        email.isScheduled = false;
        await email.save();

        // Real-time update to receiver
        const receiverUser = await User.findOne({ email: email.receiver });
        if (receiverUser) {
          io.to(receiverUser._id.toString()).emit('receive_email', email);
        }
      }
    } catch (error) {
      console.error('Error processing scheduled emails:', error);
    }
  });
};

module.exports = { startCronJobs };
