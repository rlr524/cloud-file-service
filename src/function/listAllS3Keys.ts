import { S3 } from "aws-sdk";

export default async function listAllS3Keys(
	s3Bucket: string
): Promise<string[]> {
	const s3 = new S3();
	const keys: string[] = [];
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
