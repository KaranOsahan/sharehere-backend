const cron = require('node-cron');
const AWS = require('aws-sdk');
const File = require('../modules/file-sharing/file.model');

// Configure R2 (Same as in file.service.js)
const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'auto'
});

const startCleanupJob = () => {
  // Schedule task to run every 1 minute
  cron.schedule('* * * * *', async () => {
    console.log('🧹 Running Cleanup Job...');

    try {
      // 1. Find files that have expired (expiresAt is in the past)
      const expiredFiles = await File.find({ expiresAt: { $lt: new Date() } });

      if (expiredFiles.length === 0) return;

      console.log(`🗑️ Found ${expiredFiles.length} expired files. Deleting...`);

      for (const file of expiredFiles) {
        try {
          // 2. Delete from Cloudflare R2
          await s3.deleteObject({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: file.key
          }).promise();

          console.log(`✅ Deleted from R2: ${file.filename}`);

          // 3. Delete from MongoDB
          await File.deleteOne({ _id: file._id });
          console.log(`✅ Deleted from DB: ${file.filename}`);

        } catch (err) {
          console.error(`❌ Failed to delete file ${file._id}:`, err.message);
        }
      }
    } catch (err) {
      console.error('Error in cleanup job:', err);
    }
  });
};

module.exports = startCleanupJob;