import { Storage } from "@google-cloud/storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";

const awsS3Bucket = process.env.S3_BUCKET_FILES;
const gcsStorageBucket = process.env.GCS_BUCKET;
const gcsBucketPath = process.env.GCS_DEST_PATH;

function createS3Client(region: string): S3Client {
	return new S3Client({
		region: region,
	});
}

async function listAllS3Keys(s3Bucket: string): Promise<string[]> {
	const s3 = createS3Client("us-west-2");
	const keys: string[] = [];
	const params = {
		Bucket: s3Bucket,
	};

	try {
		const response = await s3.send(new ListObjectsV2Command(params));
		if (response.Contents) {
			keys.push(
				...response.Contents.map((obj) => obj.Key!).filter(Boolean)
			);
		}
	} catch (err) {
		console.error("Error", err);
	}

	return keys;
}

/**
 * Copies a file from AWS S3 to Google Cloud Storage.
 * @param s3Bucket AWS S3 bucket name
 * @param gcsBucket Google Cloud Storage bucket name
 * @param gcsDestPath Destination path in GCS bucket
 */
async function copyS3ToGCS(
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

async function handler(
	s3Bucket: string = awsS3Bucket!,
	gcsBucket: string = gcsStorageBucket!,
	gcsDestPath: string = gcsBucketPath!
) {
	copyS3ToGCS(s3Bucket, gcsBucket, gcsDestPath);
}

handler();
