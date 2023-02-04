# AWS S3 NodeJS API

This application have following functions:

- **createS3Bucket(BucketName):** Creates the Amazon S3 bucket.
- **deleteS3Bucket(BucketName):** Deletes the Amazon S3 bucket.
- **uploadS3Object(BucketName, ObjectKey, FilePath):** Uploads a local file as Object in the Amazon S3 bucket.
- **getS3ObjectURL(BucketName, ObjectKey):** Gets a pre-signed URL of the existing object in the Amazon S3 bucket.

The picture files stored in Amazon S3 bucket can be maniputed using JavaScript Image Processing Library _(jimp)_.
