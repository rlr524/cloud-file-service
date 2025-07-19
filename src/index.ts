import { copyS3ToGCS } from "./function/copyS3ToGCS.js";

async function handler(
	s3Bucket: string,
	gcsBucket: string,
	gcsDestPath: string
) {
	copyS3ToGCS(s3Bucket, gcsBucket, gcsDestPath);
}

export default handler;
