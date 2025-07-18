import { S3 } from "aws-sdk";
import { Storage } from "@google-cloud/storage";

/**
 * Copies a file from AWS S3 to Google Cloud Storage.
 * @param s3Bucket AWS S3 bucket name
 * @param s3Key AWS S3 object key
 * @param gcsBucket Google Cloud Storage bucket name
 * @param gcsDestPath Destination path in GCS bucket
 */
export async function copyS3ToGCS(
	s3Bucket: string,
	s3Key: string,
	gcsBucket: string,
	gcsDestPath: string
): Promise<void> {
	const s3 = new S3();
	const gcs = new Storage();

	// Get object from S3
	const s3Object = await s3
		.getObject({ Bucket: s3Bucket, Key: s3Key })
		.promise();

	if (!s3Object.Body) {
		throw new Error("S3 object has no body");
	}

	// Upload to GCS
	const bucket = gcs.bucket(gcsBucket);
	const file = bucket.file(gcsDestPath);

	await file.save(s3Object.Body as Buffer);
}
