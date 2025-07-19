import { S3Client } from "@aws-sdk/client-s3";

export default function createS3Client(region: string): S3Client {
	return new S3Client({
		region: region,
	});
}
