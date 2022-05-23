import { BlobServiceClient, AnonymousCredential } from "@azure/storage-blob";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Enter your storage account name and SAS
  const account = process.env.ACCOUNT_NAME || "njteststorage";
  const accountSas = process.env.ACCOUNT_SAS || "?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2022-05-18T20:55:43Z&st=2022-05-18T12:55:43Z&spr=https&sig=qFGLLn8b6lKUcaDU%2B5%2FzDy1T27FFcg0Q%2FA%2Bv%2FfD6%2FY4%3D";

  // List containers
  const blobServiceClient = new BlobServiceClient(
    // When using AnonymousCredential, following url should include a valid SAS or support public access
    `https://${account}.blob.core.windows.net${accountSas}`,
    new AnonymousCredential()
  );

  console.log("Containers:");
  for await (const container of blobServiceClient.listContainers()) {
    console.log(`- ${container.name}`);
  }

  let i = 1;
  const iter = blobServiceClient.findBlobsByTags("index='test'");
  let blobItem = await iter.next();
  while (!blobItem.done) {
    console.log(`Blob ${i}: ${blobItem.value.name}`);
    console.log(`Container ${i}: ${JSON.stringify(blobItem.value)}`);
    console.log(`https://${account}.blob.core.windows.net/${blobItem.value.containerName}/${blobItem.value.name}${accountSas}`);
    i++;
    blobItem = await iter.next();
  }

  // Create a container
  //const containerName = `newcontainer${new Date().getTime()}`;
  //const containerClient = blobServiceClient.getContainerClient(containerName);

  // const createContainerResponse = await containerClient.create();
  //console.log(`Created container ${containerName} successfully`, createContainerResponse.requestId);

  // Delete container
  //await containerClient.delete();

  //console.log("Deleted container:", containerClient.containerName);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});