const AWS = require('aws-sdk');
const File = require('./file.model');
const { v4: uuidv4 } = require('uuid');

// Configure R2 as if it were S3
const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'auto'
});

/**
 * 1. Generate Presigned URL (Upload)
 */
exports.getUploadUrl = async (fileName, fileType, userId) => {
  const fileId = uuidv4();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const key = `${userId}/${fileId}-${fileName}`;

  // Signed URL valid for 5 minutes
  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Expires: 300, 
    ContentType: fileType
  };

  const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

  return { uploadUrl, key, fileId, code };
};

/**
 * 2. Save Metadata (DB Save)
 */
exports.saveFileMetadata = async (fileData) => {
  const file = await File.create({
    _id: fileData.fileId,
    filename: fileData.fileName,
    key: fileData.key,
    size: fileData.size,
    type: fileData.type,
    owner: fileData.userId,
    code: fileData.code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)  // 10 Minutes
  });

  return file;
};

/**
 * 3. Generate Signed Download URL (Force Download)
 */
exports.getDownloadUrl = async (key, filename) => {
  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Expires: 3600, // 1 hour
    // 🔥 This line forces the browser to download instead of open
    ResponseContentDisposition: `attachment; filename="${filename}"`
  };
  
  return await s3.getSignedUrlPromise('getObject', params);
};