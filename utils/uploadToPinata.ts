import fs from "fs";
import path from "path";
import pinataSDK, { PinataPinResponse } from "@pinata/sdk";

const pinataApiKey = process.env.PINATA_API_KEY!;
const pinataApiSecret = process.env.PINATA_API_SECRET!;
const pinata = pinataSDK(pinataApiKey, pinataApiSecret);

export async function storeImages(
    imagesFilePath: string
): Promise<{ responses: PinataPinResponse[]; files: string[] }> {
    const fullImagesPath = path.resolve(imagesFilePath);
    const files = fs.readdirSync(fullImagesPath);
    console.log(files);
    let responses: PinataPinResponse[] = [];
    console.log("Uploading to Pinata");
    for (let fileIndex in files) {
        console.log(`Working on ${files[fileIndex]} file`);
        const readableStream = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);
        try {
            const response: PinataPinResponse = await pinata.pinFileToIPFS(readableStream);
            responses.push(response);
        } catch (error) {
            console.log(error);
        }
    }
    return { responses, files };
}

export async function storeTokenUriMetadata(tokenUriMetadata: object): Promise<PinataPinResponse> {
    let response: PinataPinResponse;
    try {
        response = await pinata.pinJSONToIPFS(tokenUriMetadata);
    } catch (error) {
        console.log(error);
    }
    return response!;
}
