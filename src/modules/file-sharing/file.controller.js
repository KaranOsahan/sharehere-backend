const fileService = require('./file.service');
const File = require('./file.model');

// 1. Get Presigned URL (Step 1 of Upload)
exports.initializeUpload = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    const userId = req.user?.id || 'anonymous'; // Fallback for public routes

    if (!fileName || !fileType) {
      return res.status(400).json({ message: "File name and type are required" });
    }

    const uploadData = await fileService.getUploadUrl(fileName, fileType, userId);

    res.json({
      success: true,
      ...uploadData
    });

  } catch (error) {
    console.error("Upload Init Error:", error);
    res.status(500).json({ message: "Could not generate upload URL" });
  }
};

// 2. Finalize Upload (Step 2 of Upload)
exports.finalizeUpload = async (req, res) => {
  try {
    const { key, fileName, size, type, code, fileId } = req.body;
    const userId = req.user?.id || 'anonymous';

    const file = await fileService.saveFileMetadata({
      key, fileName, size, type, code, fileId, userId
    });

    res.json({
      success: true,
      message: "File saved successfully",
      file
    });

  } catch (error) {
    console.error("Upload Finalize Error:", error);
    res.status(500).json({ message: "Could not save file metadata" });
  }
};

// 3. Get File by Code (Download)
exports.getFile = async (req, res) => {
  try {
    const { code } = req.params;
    const file = await File.findOne({ code });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // 🔥 FIX: Check Expiration
    if (new Date() > new Date(file.expiresAt)) {
      return res.status(410).json({ message: "This file has expired and is no longer available." });
    }

    // Generate real Signed URL
    const downloadUrl = await fileService.getDownloadUrl(file.key, file.filename);

    res.json({
      success: true,
      file,
      downloadUrl
    });

  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).json({ message: "Error retrieving file" });
  }
};