// Amazon S3 modules.
import {
  S3Client,
  CreateBucketCommand,
  DeleteBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Additional modules
import fs from "fs";
import Jimp from "jimp";

// The constant literals.
const REGION = "ap-south-1"; // Mumbai
const BucketName = "picture-thumbnail-bucket";

// Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: REGION });

// Amazon S3 related functions.

// This function creates amazon S3 bucket.
// Input: Bucket Name.
// Output: None.

async function createS3Bucket(BucketName) {
  // Prepare Create Bucket Command.
  let cmd = new CreateBucketCommand({ Bucket: BucketName });

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
// Input: Bucket Name.
// Output: None.

async function deleteS3Bucket(BucketName) {
  // Prepare delete bucket command.
  let cmd = new DeleteBucketCommand({ Bucket: BucketName });

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
// Input: Bucket Name, Object Key and File content as ReadableStream.
// Output: None.

async function uploadS3Object(BucketName, ObjectKey, FileContent) {
  // Prepare the put object command.
  let param = {
    Bucket: BucketName,
    Key: ObjectKey,
    Body: FileContent,
  };
  let cmd = new PutObjectCommand(param);

  // Upload amazon S3 object.
  try {
    const response = await s3Client.send(cmd);
    console.log(
      `\nFile uploaded successfully!\nBucket - ${BucketName} | Object Key - ${ObjectKey}\n`
    );
  } catch (error) {
    console.log("\nERROR!");
    console.log(`Bucket Name: ${BucketName}\nError Code: ${error.Code}\n`);
    console.log(error);
  }
}

// This function gets a pre-signed URL of amazon S3 bucket object.
// Input: Bucket Name, Object Key.
// Output: Pre-signed URL.

async function getS3ObjectURL(BucketName, ObjectKey) {
  // Prepare the get object command.
  let param = {
    Bucket: BucketName,
    Key: ObjectKey,
  };
  let cmd = new GetObjectCommand(param);

  // Get amazon S3 object Pre-Signed URL.
  try {
    // Create the presigned URL.
    const signedUrl = await getSignedUrl(s3Client, cmd, {
      expiresIn: 3600,
    });
    console.log(`\n${ObjectKey} URL - ${signedUrl}.\n`);
    return signedUrl;
  } catch (error) {
    console.log("\nERROR!");
    console.log(`Bucket Name: ${BucketName}\nError Code: ${error.Code}\n`);
    console.log(error);
  }
}

// Additional Helper functions.

// This function creates black and white thumbnail of image.
// Input: Image URL in S3 bucket.
// Output: The transformed image stream.

async function makeBWThumbnail(ImageURL) {
  const TempWriteFilePath = "tmp/dummy.jpg";
  try {
    let InputImage = await Jimp.read(ImageURL);
    let NewImage = InputImage.resize(256, Jimp.AUTO).grayscale().quality(80);
    await NewImage.writeAsync(TempWriteFilePath);
    let Content = fs.createReadStream(TempWriteFilePath);
    return Content;
  } catch (error) {
    console.log("\nImage Processing Error!\n");
    console.log(error);
  }
}

// Main execution.

async function main() {
  // await createS3Bucket(BucketName);
  // await deleteS3Bucket(BucketName);

  let FilePath = "Pictures/23.jpg";
  let ObjectKey = FilePath;
  let OutObjKey = `Thumbnail/${
    FilePath.split("/")[1].split(".")[0]
  }_BW_Thumbnail.jpg`;

  // Create the read stream form the file path.
  // let FileContent = fs.createReadStream(FilePath);
  // await uploadS3Object(BucketName, ObjectKey, FileContent);

  // Get the image URL.
  let FileURL = await getS3ObjectURL(BucketName, ObjectKey);
  // Get the Thumbnail Content.
  let FileContent = await makeBWThumbnail(FileURL);
  if (FileContent) {
    await uploadS3Object(BucketName, OutObjKey, FileContent);
  }
}

main();
