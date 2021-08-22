// config.js
const path = require('path');
const dir = path.join(`${__dirname}`, '.env');
require('dotenv').config({ path: dir });
// const dotenv = require('dotenv');
// dotenv.config();
module.exports = {
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
  GCP_BUCKET_ID: process.env.GCP_BUCKET_ID,
  GCP_KEYFILE_JSON: process.env.GCP_KEYFILE_JSON,
  AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  INSTAGRAM_USERNAME: process.env.INSTAGRAM_USERNAME,
  INSTAGRAM_PASSWORD: process.env.INSTAGRAM_PASSWORD,
};
