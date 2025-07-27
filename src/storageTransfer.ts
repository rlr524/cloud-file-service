import * as storageTransfer from "@google-cloud/storage-transfer";

const gcpProjectID = process.env.GCP_PROJECT_ID;
const gcsSinkBucket = process.env.GCS_BUCKET;
const awsSourceBucket = process.env.S3_BUCKET_FILES;

const client = new storageTransfer.StorageTransferServiceClient();

export default async function transferFromS3() {
	const [transferJob] = await client.createTransferJob({
		transferJob: {
			projectId: gcpProjectID,
			description: "Transfer from S3 to GCP",
			status: "ENABLED",
			transferSpec: {
				awsS3DataSource: {
					bucketName: awsSourceBucket,
				},
				gcsDataSink: {
					bucketName: gcsSinkBucket,
				},
			},
		},
	});

	await client.runTransferJob({
		jobName: transferJob.name,
		projectId: gcpProjectID,
	});

	console.info(
		`Created and ran a transfer job from ${awsSourceBucket} to ${gcsSinkBucket} with name ${transferJob.name}`
	);
}
