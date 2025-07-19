import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import createS3Client from "../libs/s3Client.js";

export default async function deleteS3File(
	s3Bucket: string,
	s3Key: string
): Promise<void> {
	const s3 = createS3Client("us-west-2");
	const params = {
		Bucket: s3Bucket,
		Key: s3Key,
	};

	try {
		const data = await s3.send(new DeleteObjectCommand(params));
		console.info("Success. Object deleted", data);
	} catch (err) {
		console.error("Error", err);
	}
}
