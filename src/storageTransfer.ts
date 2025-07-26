import * as storageTransfer from "@google-cloud/storage-transfer";

const { AuthMethod, NetworkProtocol, RequestModel } =
	storageTransfer.protos.google.storagetransfer.v1.S3CompatibleMetadata;

const gcpProjectID = process.env.GCP_PROJECT_ID;
const gcsSinkBucket = process.env.GCS_BUCKET;
const gcsPath = process.env.GCS_DEST_PATH;
const awsSourceBucket = process.env.S3_BUCKET_FILES;
const awsSourcePath = process.env.S3_SOURCE_PATH;
const awsSourcePoolName = process.env.S3_SOURCE_POOL;
const authMethod = AuthMethod.AUTH_METHOD_AWS_SIGNATURE_V4;
const protocol = NetworkProtocol.NETWORK_PROTOCOL_HTTPS;
const requestModel = RequestModel.REQUEST_MODEL_VIRTUAL_HOSTED_STYLE;
const endpoint = "us-west-2.example.com";

const client = new storageTransfer.StorageTransferServiceClient();

export default async function transferFromS3() {
	const [transferJob] = await client.createTransferJob({
		transferJob: {
			projectId: gcpProjectID,
			transferSpec: {
				sourceAgentPoolName: awsSourcePoolName,
				awsS3CompatibleDataSource: {
					region: process.env.AWS_REGION,
					s3Metadata: {
						authMethod,
						protocol,
						requestModel,
					},
					endpoint,
					bucketName: awsSourceBucket,
					path: awsSourcePath,
				},
				gcsDataSink: {
					bucketName: gcsSinkBucket,
					path: gcsPath,
				},
			},
			status: "ENABLED",
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
