const express = require('express');
const upload = require('../config/multer');
const { bucket } = require('../config/firebaseStorage');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const User = require('./../models/userModel')
const app = express();

const uploadImage = async (req) => {
  try {
    if (!req.file) {
      return 'No file uploaded.';
    }

    // Check if the file is an image
    if (!req.file.mimetype.startsWith('image/')) {
      return 'The uploaded file is not an image.';
    }
  // Resize the image
  const resizedBuffer = await sharp(req.file.buffer)
  .resize(300, 300) // Resize the image to 800x600 pixels
  .jpeg({ quality: 80 }) // Compress the image to 80% quality
  .toBuffer();

    const filename = `${uuidv4()}-${req.file.originalname}`;
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      }
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        reject(err.message);
      });

      blobStream.on('finish', async () => {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      });

      blobStream.end(resizedBuffer);
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = uploadImage;

 const uploadImages = async (file) => {
  try {
    if (!file) {
      return 'No file uploaded.';
    }
   
    // Check if the file is an image
    if (!file.mimetype.startsWith('image/')) {
      return 'The uploaded file is not an image.';
    }

    const filename = `${uuidv4()}-${file.originalname}`;
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        reject(err.message);
      });

      blobStream.on('finish', async () => {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = uploadImages;


const uploadFile = async (file) => {
  try {
    if (!file) {
      return 'No file uploaded.';
    }
    const filename = `${uuidv4()}-${file.originalname}`;
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        reject(err.message);
      });

      blobStream.on('finish', async () => {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = uploadFile;