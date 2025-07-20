import { Storage } from "@google-cloud/storage";
import listAllS3Keys from "./listAllS3Keys.js";
import createS3Client from "../libs/s3Client.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

/**
 * Copies a file from AWS S3 to Google Cloud Storage.
 * @param s3Bucket AWS S3 bucket name
 * @param gcsBucket Google Cloud Storage bucket name
 * @param gcsDestPath Destination path in GCS bucket
 */
export async function copyS3ToGCS(
	s3Bucket: string,
	gcsBucket: string,
	gcsDestPath: string
): Promise<void> {
	const s3 = createS3Client("us-west-2");
	const gcs = new Storage();

	const gbucket = gcs.bucket(gcsBucket);
	const fileToCopy = gbucket.file(gcsDestPath);

	// Get a list of object keys from the S3 bucket
	const s3ObjectKeyArray: string[] = await listAllS3Keys(s3Bucket);

	// Get object from S3 and upload to GCS
	for (let i = 0; i < s3ObjectKeyArray.length; i++) {
		const params = {
			Bucket: s3Bucket,
			Key: s3ObjectKeyArray[i],
		};

		const s3Object = await s3.send(new GetObjectCommand(params));

		if (!s3Object.Body) {
			throw new Error("S3 object has no body");
		}
		await fileToCopy.save(s3Object.Body as unknown as Buffer);
	}
}
