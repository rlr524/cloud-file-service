import * as storageTransfer from "@google-cloud/storage-transfer";

const { AuthMethod, NetworkProtocol, RequestModel } =
	storageTransfer.protos.google.storagetransfer.v1.S3CompatibleMetadata;

/** 
 * Example
 * // Useful enums for AWS S3-Compatible Transfers
// const {AuthMethod, NetworkProtocol, RequestModel} = storageTransfer.protos.google.storagetransfer.v1.S3CompatibleMetadata;

// Your project id
// const projectId = 'my-project';

// The agent pool associated with the S3-compatible data source. Defaults to the default agent
// const sourceAgentPoolName = 'projects/my-project/agentPools/transfer_service_default';

// The S3-compatible bucket name to transfer data from
// const sourceBucketName = "my-bucket-name";

// The S3-compatible path (object prefix) to transfer data from
// const sourcePath = "path/to/data/";

// The ID of the GCS bucket to transfer data to
// const gcsSinkBucket = "my-sink-bucket";

// The GCS path (object prefix) to transfer data to
// const gcsPath = "path/to/data/";

// The S3 region of the source bucket
// const region = 'us-east-1';

// The S3-compatible endpoint
// const endpoint = "us-east-1.example.com";

// The S3-compatible network protocol
// const protocol = NetworkProtocol.NETWORK_PROTOCOL_HTTPS;

// The S3-compatible request model
// const requestModel = RequestModel.REQUEST_MODEL_VIRTUAL_HOSTED_STYLE;

// The S3-compatible auth method
// const authMethod = AuthMethod.AUTH_METHOD_AWS_SIGNATURE_V4;
*/

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
