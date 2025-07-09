const AWS = require('aws-sdk');
// S3 setup (assume already configured in app.js)
const s3 = new AWS.S3({
    endpoint: 'http://localhost:4566',
    accessKeyId: 'test',
    secretAccessKey: 'test',
    s3ForcePathStyle: true
  });

  module.exports = s3;
 