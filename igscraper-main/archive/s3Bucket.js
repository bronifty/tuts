const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const dir = path.join(`${__dirname}`, '.env');
require('dotenv').config({ path: dir });

const s3upload = {
  upload: async () => {
    const file = './tmp/google.png'; // Path to and name of object. For example '../myFiles/index.js'.
    const fileStream = fs.createReadStream(file);

    // Set the parameters
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      // Add the required 'Key' parameter using the 'path' module.
      Key: path.basename(file),
      // Add the required 'Body' parameter
      Body: fileStream,
    };

    const S3 = new AWS.S3({
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      },
    });
    try {
      const uploadData = await S3.upload(uploadParams, (error, data) => {
        console.log(error, data);
        if (error) {
          return console.log(error);
        }
      });

      const params2 = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: path.basename(file),
        Expires: 999999,
      };

      const signedURL = S3.getSignedUrl('getObject', params2);
      console.log(signedURL);
      return JSON.stringify(signedURL);
    } catch (err) {
      console.log('Error', err);
    }
  },
};

module.exports = s3upload;
