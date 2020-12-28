const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const constant = require('../Utils/constant');

const account = process.env.AZURE_BLOB_ACCOUNT;
const accountKey = process.env.AZURE_BLOB_KEY;
const dishContainer = process.env.AZURE_BLOB_DISH_CONTAINER;
const dishStepContainer = process.env.AZURE_BLOB_DISHSTEP_CONTAINER;
const ingredientContainer = process.env.AZURE_BLOB_INGREDIENT_CONTAINER;
const userContainer = process.env.AZURE_BLOB_USER_CONTAINER;

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    sharedKeyCredential
);
const dishContainerClient = blobServiceClient.getContainerClient(dishContainer);
const dishStepContainerClient = blobServiceClient.getContainerClient(dishStepContainer);
const ingredientContainerClient = blobServiceClient.getContainerClient(ingredientContainer);
const userContainerClient = blobServiceClient.getContainerClient(userContainer);

async function test() {
    let i = 1;
    let containers = blobServiceClient.listContainers();
    for await (const container of containers) {
        console.log(`Container ${i++}: ${container.name}`);
    }
    console.log(`Container: ${dishContainerClient.containerName}`);
    console.log(`Container: ${dishStepContainerClient.containerName}`);
    console.log(`Container: ${ingredientContainerClient.containerName}`);
    console.log(`Container: ${userContainerClient.containerName}`);
}

async function uploadImage(userID, image, extension) { ///////////////////////////////////////////////////////////////

    let imageName = constant.createUserImageName(userID, extension);
    const blockBlobClient = userContainerClient.getBlockBlobClient(imageName);
    const uploadBlobResponse = await blockBlobClient.upload(image.buffer, image.size);
    return blockBlobClient.url;
}
async function uploadIngredientImage(name, image){
    const blockBlobClient = ingredientContainerClient.getBlockBlobClient(name);
    const uploadBlobResponse = await blockBlobClient.upload(image.buffer, image.size);
    return name;
}
async function uploadDishImage(name, image){
    const blockBlobClient = dishContainerClient.getBlockBlobClient(name);
    const uploadBlobResponse = await blockBlobClient.upload(image.buffer, image.size);
    return name;
}
async function uploadDishStepImage(name, image){
    const blockBlobClient = dishStepContainerClient.getBlockBlobClient(name);
    const uploadBlobResponse = await blockBlobClient.upload(image.buffer, image.size);
    return name;
}
/*
async function uploadImage(productId, image, extension) {
    let allBlobs = [];
    for await (const blob of containerClient.listBlobsFlat()) {
        allBlobs.push(blob.name);
    }
    const allBlobsStr = allBlobs.join(" ");
    let num = 1;
    let imageName = constant.createProductImageName(productId, num, "");
    while (allBlobsStr.includes(imageName)){
        num++;
        imageName = constant.createProductImageName(productId, num, "");
    }
    imageName += extension;
    const blockBlobClient = containerClient.getBlockBlobClient(imageName);
    const uploadBlobResponse = await blockBlobClient.upload(image.buffer, image.size);
    return blockBlobClient.url;
}
async function deleteImages(imageNames){
    let allBlobs = [];
    for await (const blob of containerClient.listBlobsFlat()) {
        allBlobs.push(blob.name);
    }
    let deletePromises = imageNaes.map((imageName) => {
        return new Promise(async (resolve, reject) => {
            try {
                const deleteBlock = allBlobs.filter((blob) => {
                    return blob.includes(imageName);
                }) 
                if (deleteBlock.length > 0){
                    let result = await containerClient.deleteBlob(deleteBlock[0], {
                        deleteSnapshots: "include"
                    });
                    resolve(result);
                }
                resolve(1);
            } catch (err) {
                console.log(err);
            }
        })
    });
  *   return Promise.all(deletePromises);

*/
module.exports = {
    uploadImage: uploadImage,
    uploadIngredientImage,
    uploadDishImage,
    uploadDishStepImage
    //deleteImages: deleteImages
}