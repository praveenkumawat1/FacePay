const AWS = require("aws-sdk");
require("dotenv").config();

// ⚡ OPTIMIZATION: Use Mumbai region (closest to India)
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "ap-south-1", //  Mumbai, India (ensure this is closest)

  //  HTTP optimization
  httpOptions: {
    timeout: 30000, // ⚡ INCREASED: 30 second timeout for processing
    connectTimeout: 10000, // ⚡ INCREASED: 10 second connection timeout
  },

  //  Retry configuration (reduced for speed)
  maxRetries: 1,
  retryDelayOptions: {
    base: 300,
  },
});

const rekognition = new AWS.Rekognition();

const COLLECTION_ID =
  process.env.AWS_REKOGNITION_COLLECTION_ID || "facepay-users";

/**
 * Initialize Rekognition collection
 */
const initializeCollection = async () => {
  try {
    console.log("🔄 Checking AWS Rekognition collection...");
    console.log("Region:", AWS.config.region);
    console.log("Collection ID:", COLLECTION_ID);

    console.time("Collection Check");

    const collections = await rekognition.listCollections().promise();

    console.timeEnd("Collection Check");

    if (!collections.CollectionIds.includes(COLLECTION_ID)) {
      console.log(`🔄 Creating collection: ${COLLECTION_ID}`);

      await rekognition
        .createCollection({
          CollectionId: COLLECTION_ID,
        })
        .promise();

      console.log(`✅ Collection created: ${COLLECTION_ID}`);
    } else {
      console.log(`✅ Collection already exists: ${COLLECTION_ID}`);
    }
  } catch (error) {
    console.error("❌ Error initializing collection:", error.message);

    // Don't crash app if collection check fails
    console.warn("⚠️ Continuing without collection verification...");
  }
};

module.exports = {
  rekognition,
  COLLECTION_ID,
  initializeCollection,
};
