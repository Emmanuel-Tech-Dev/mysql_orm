const {
  uploadFromBuffer,
  uploadFromPath,
  deleteFile,
} = require("../config/cloudinary");
const fs = require("fs");

class UploadService {
  // Upload single file to Cloudinary
  async uploadSingleFile(file, folder = "home/testing folder") {
    try {
      const isImage = file.mimetype.startsWith("image/");
      const isVideo = file.mimetype.startsWith("video/");

      if (!isImage && !isVideo) {
        throw new Error("Only image and video files are supported");
      }

      const options = {
        folder,
        resource_type: isImage ? "image" : "video",
        public_id: file.originalname.split(".")[0], // Use original filename without extension
      };

      let result;

      if (file.buffer) {
        // Memory storage - upload from buffer
        result = await uploadFromBuffer(file.buffer, options);
      } else if (file.path) {
        // Disk storage - upload from file path
        result = await uploadFromPath(file.path, options);
        // Clean up temporary file
        fs.unlinkSync(file.path);
      } else {
        throw new Error("No file buffer or path found");
      }
      const data = {
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
        format: result.format,
        size: result.bytes,
        version: result.version, // Version number changes on update
      };

      // const response = {
      //   success: true,
      //   status: "success",
      //   statusCode: 200,
      //   message: "Operation successful!",
      //   data: data,
      // };

      return data;
    } catch (error) {
      // Clean up temporary file on error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Operation failed!",
        errorMessage: error.message,
      };

      logger.error({ ...response, errorDetails: error });
      return response;
    }
  }
  // In your uploadService.js
  async updateFile(file, publicId, folder = "home/Test") {
    try {
      const isImage = file.mimetype.startsWith("image/");
      const isVideo = file.mimetype.startsWith("video/");

      const options = {
        folder,
        resource_type: isImage ? "image" : "video",
        public_id: publicId, // Same public_id = overwrite
        overwrite: true, // Explicitly allow overwrite
        invalidate: true, // Clear cached versions
      };

      let result;

      if (file.buffer) {
        result = await uploadFromBuffer(file.buffer, options);
      } else if (file.path) {
        result = await uploadFromPath(file.path, options);
        fs.unlinkSync(file.path);
      }

      const data = {
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
        format: result.format,
        size: result.bytes,
        version: result.version, // Version number changes on update
      };

      return data;
    } catch (error) {
      const response = {
        message: "Operation failed!",
        errorMessage: error.message,
      };

      return response;
    }
  }

  // In your uploadService.js
  async replaceFile(file, oldPublicId, folder = "home/Test") {
    try {
      // Delete old file
      await this.deleteFile(oldPublicId);

      // Upload new file
      const result = await this.uploadSingleFile(file, folder);

      return result;
    } catch (error) {
      const response = {
        message: "Operation failed!",
        errorMessage: error.message,
      };

      return response;
    }
  }

  // Upload multiple files to Cloudinary
  async uploadMultipleFiles(files, folder = "home/testing folder") {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadSingleFile(file, folder)
      );
      const results = await Promise.all(uploadPromises);

      return results;
    } catch (error) {
      const response = {
        message: "Operation failed!",
        errorMessage: error.message,
      };

      //  logger.error({ ...response, errorDetails: error });
      return response;
    }
  }

  // Delete file from Cloudinary
  async deleteFile(publicId) {
    try {
      const result = await deleteFile(publicId);

      const response = {
        message: "Operation successful!",
        // data: results,
      };

      return result;
    } catch (error) {
      const response = {
        message: "Operation failed!",
        errorMessage: error.message,
      };

      return response;
    }
  }

  // Get file type from mimetype
}

module.exports = new UploadService();
