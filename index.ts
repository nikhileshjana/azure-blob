import express, { Express, Request, Response } from 'express';
import { BlobServiceClient, AnonymousCredential } from "@azure/storage-blob";
import dotenv from 'dotenv';
import axios from 'axios';

const app: Express = express();
const port: any = process.env.NODE_PORT || 3000;

dotenv.config();

app.get('/partial-download/:container/:filename', (req: Request, res: Response) => {
    const storageAccount = process.env.ACCOUNT_NAME;
    const accountSas = process.env.ACCOUNT_SAS;
    const startByte = req.headers.startbyte;
    const offset = req.headers.offset;
    const requestHeader = {
        "x-ms-range": "bytes=" + startByte + "-" + offset,
        "x-ms-client-request-id": 'abcd', //This will be the correlation id
        "x-ms-range-get-content-md5": true
    }
    const url = `https://${storageAccount}.blob.core.windows.net/${req.params.container}/${req.params.filename}${accountSas}`;
    axios.get(url, { headers: requestHeader }).then(axiosRes => {
        res.setHeader("blob-content-length", axiosRes.headers["content-length"]);
        res.setHeader("blob-content-type", axiosRes.headers["content-type"]);
        res.setHeader("blob-content-md5", axiosRes.headers["content-md5"]);
        res.setHeader("blob-content-range", axiosRes.headers["content-range"]);
        res.setHeader("blob-full-content-length", axiosRes.headers["content-range"].split("/")[1]);
        res.status(axiosRes.status);
        res.send(axiosRes.data)
    }).catch(error => {
        console.log("ERROR --> " + error);
        throw error;
    })
})

app.get('/download/:container/:filename', (req: Request, res: Response) => {
    const storageAccount = process.env.ACCOUNT_NAME;
    const accountSas = process.env.ACCOUNT_SAS;

    // When using AnonymousCredential, following url should include a valid SAS or support public access
    const blobServiceClient = new BlobServiceClient(`https://${storageAccount}.blob.core.windows.net${accountSas}`, new AnonymousCredential());
    const containerClient = blobServiceClient.getContainerClient(req.params.container);
    const blockBlobClient = containerClient.getBlockBlobClient(req.params.filename);
    console.log("BLOB URL --> ", blockBlobClient.url);
    //blockBlobClient.downloadToFile("downloadedfile.pdf", 0, undefined);
    //console.log("Props--> "+JSON.stringify(blockBlobClient.getProperties()));
    //blockBlobClient.downloadToBuffer();
    //Promise<Buffer> buffer = blockBlobClient.downloadToBuffer(0, 10);
    const bufffer = blockBlobClient.downloadToBuffer();
    res.status(200).send(bufffer);
})

app.listen(port, () => {
    console.log("Server is running on port " + port);
})


