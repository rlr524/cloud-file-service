import createS3Client from "../libs/s3Client.js";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export default async function listAllS3Keys(
	s3Bucket: string
): Promise<string[]> {
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
