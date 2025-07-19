import { S3 } from "aws-sdk";
import { Storage } from "@google-cloud/storage";

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
	const s3 = new S3();
	const gcs = new Storage();

	const gbucket = gcs.bucket(gcsBucket);
	const fileToCopy = gbucket.file(gcsDestPath);

	// Get a list of object keys from the S3 bucket
	const s3ObjectKeyArray: string[] = await listAllS3Keys(s3Bucket);

	// Get object from S3 and upload to GCS
	for (let i = 0; i < s3ObjectKeyArray.length; i++) {
		const s3Object = await s3
			.getObject({ Bucket: s3Bucket, Key: s3ObjectKeyArray[i] })
			.promise();

		if (!s3Object.Body) {
			throw new Error("S3 object has no body");
		}
		await fileToCopy.save(s3Object.Body as Buffer);
	}
}

async function listAllS3Keys(s3Bucket: string): Promise<string[]> {
	const s3 = new S3();
	let keys: string[] = [];
	let token: string | undefined = undefined;

	do {
		const response = await s3
			.listObjectsV2({
				Bucket: s3Bucket,
				ContinuationToken: token,
			})
			.promise();
		// Add .filter(Boolean) function as a check to filter out any null or undefined values
		if (response.Contents) {
			keys.push(...response.Contents.map((o) => o.Key!).filter(Boolean));
		}
		token = response.IsTruncated
			? response.NextContinuationToken
			: undefined;
	} while (token);

	return keys;
}
