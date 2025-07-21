import { copyS3ToGCS } from "./functions/copyS3ToGCS.js";

const awsS3Bucket = process.env.S3_BUCKET_FILES
const gcsStorageBucket = process.env.GCS_BUCKET
const gcsBucketPath = process.env.GCS_DEST_PATH


async function handler(
	s3Bucket: string = awsS3Bucket!,
	gcsBucket: string = gcsStorageBucket!,
	gcsDestPath: string = gcsBucketPath!
) {
	copyS3ToGCS(s3Bucket, gcsBucket, gcsDestPath);
}

export default handler;
