import transferFromS3 from "./storageTransfer.js";

async function handler() {
	transferFromS3();
}

handler();
