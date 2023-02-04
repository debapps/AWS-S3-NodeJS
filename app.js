const awsS3 = require("@aws-sdk/client-s3");
const SignURL = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const Jimp = require("jimp");

// The contants.
const REGION = "ap-south-1"; // Mumbai
const BucketName = "picture-thumbnail-bucket";

// Create an Amazon S3 service client object.
const s3Client = new awsS3.S3Client({ region: REGION });

// This function creates amazon S3 bucket.
async function createS3Bucket(BucketName) {
  // Prepare Create Bucket Command.
  let cmd = new awsS3.CreateBucketCommand({ Bucket: BucketName });

  // Create amazon S3 Bucket.
  try {
    const response = await s3Client.send(cmd);
    console.log(`\nBucket: ${response.Location} is created SUCCESSFULLY.\n`);
  } catch (error) {
    console.log("\nERROR!");
    console.log(
      `Bucket Name: ${error.BucketName}\nError Code: ${error.Code}\n`
    );
  }
}

// This function deletes amazon S3 bucket.
async function deleteS3Bucket(BucketName) {
  // Prepare delete bucket command.
  let cmd = new awsS3.DeleteBucketCommand({ Bucket: BucketName });

  // Delete amazon S3 Bucket.
  try {
    const response = await s3Client.send(cmd);
    console.log(`\nBucket: ${BucketName} is deleted SUCCESSFULLY.\n`);
  } catch (error) {
    console.log("\nERROR!");
    console.log(
      `Bucket Name: ${error.BucketName}\nError Code: ${error.Code}\n`
    );
  }
}

// This function uploads a file into amazon S3 bucket.
async function uploadS3Object(BucketName, ObjectKey, FilePath) {
  // Create the read stream form the file path.
  let FileContent = fs.createReadStream(FilePath);

  // Prepare the put object command.
  let param = {
    Bucket: BucketName,
    Key: ObjectKey,
    Body: FileContent,
  };
  let cmd = new awsS3.PutObjectCommand(param);

  // Upload amazon S3 object.
  try {
    const response = await s3Client.send(cmd);
    console.log(`\n${ObjectKey} is uploaded into ${BucketName} successfully.`);
  } catch (error) {
    console.log("\nERROR!");
    console.log(`Bucket Name: ${BucketName}\nError Code: ${error.Code}\n`);
  }
}

// This function gets a file content as stream from amazon S3 bucket.
async function getS3ObjectURL(BucketName, ObjectKey) {
  // Prepare the get object command.
  let param = {
    Bucket: BucketName,
    Key: ObjectKey,
  };
  let cmd = new awsS3.GetObjectCommand(param);

  // Get amazon S3 object Pre-Signed URL.
  try {
    // Create the presigned URL.
    const signedUrl = await SignURL.getSignedUrl(s3Client, cmd, {
      expiresIn: 3600,
    });
    console.log(`\n${ObjectKey} URL - ${signedUrl}.`);
    return signedUrl;
  } catch (error) {
    console.log("\nERROR!");
    console.log(`Bucket Name: ${BucketName}\nError Code: ${error.Code}\n`);
    console.log(error);
  }
}

// Additional Helper functions.

// This function converts the steam into Buffer

// Main execution.

async function main() {
  // await createS3Bucket(BucketName);
  // await deleteS3Bucket(BucketName);

  let FilePath = "./Pictures/33.jpg";
  let ObjectKey = `${FilePath.split("/")[1]}/${FilePath.split("/")[2]}`;
  let OutFileName = `./Pictures/output/${
    FilePath.split("/")[2].split(".")[0]
  }_BW.jpg`;

  // await uploadS3Object(BucketName, ObjectKey, FilePath);

  let FileURL = await getS3ObjectURL(BucketName, ObjectKey);
  Jimp.read(FileURL, (err, pic) => {
    if (err) throw err;
    pic.grayscale().write(OutFileName);
    console.log(`\nThe Black and White Image saved in ${OutFileName}\n`);
  });
}

main();
