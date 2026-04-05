import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Enroll face during signup
 *
 * FIX: Removed browser-side imageCompression (browser-image-compression library).
 * Previously the image was compressed TWICE:
 *   1. browser-image-compression (200KB, 500px) on the frontend
 *   2. sharp resize (500x500, quality 80) on the backend middleware
 *
 * Double compression was degrading face image quality so badly that
 * AWS Rekognition couldn't detect a face, causing enrollFace to hang/fail.
 *
 * Now: raw File is sent directly. Backend sharp handles the only resize.
 *
 * @param {string} userId - MongoDB User ID
 * @param {File} faceImageFile - Captured face image file (raw, no pre-compression)
 * @returns {Promise<Object>}
 */
export const enrollFace = async (userId, faceImageFile) => {
  try {
    console.log("🔐 enrollFace called:", {
      userId,
      fileName: faceImageFile?.name,
      fileSize: faceImageFile?.size,
      fileType: faceImageFile?.type,
    });

    if (!userId) throw new Error("userId is required for face enrollment");
    if (!faceImageFile) throw new Error("faceImageFile is required");
    if (!(faceImageFile instanceof File))
      throw new Error("faceImageFile must be a File object");

    const formData = new FormData();
    formData.append("userId", userId);
    // Send raw file — backend sharp middleware handles resize/compression
    formData.append("faceImage", faceImageFile, faceImageFile.name);

    console.log(
      "🚀 Sending enroll request to:",
      `${API_BASE_URL}/aws-face/enroll`,
    );

    const response = await axios.post(
      `${API_BASE_URL}/aws-face/enroll`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // 🔥 INCREASED: 60s timeout — AWS Rekognition processing + Network upload can take longer
        timeout: 60000,
      },
    );

    console.log("✅ enrollFace success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Enroll face error:", error);
    // If axios error, throw the backend's error message
    throw error.response?.data || error;
  }
};

/**
 * Verify face during login
 * @param {File} faceImageFile - Captured face image file
 * @returns {Promise<Object>}
 */
export const verifyFace = async (faceImageFile) => {
  try {
    const formData = new FormData();
    formData.append("faceImage", faceImageFile);

    const response = await axios.post(
      `${API_BASE_URL}/aws-face/verify`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      },
    );

    return response.data;
  } catch (error) {
    console.error("❌ Verify face error:", error);
    throw error.response?.data || error;
  }
};

/**
 * Test AWS connection
 */
export const testAWSConnection = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL.replace("/api", "")}/health`,
    );
    return response.data;
  } catch (error) {
    console.error("❌ AWS connection test failed:", error);
    return { success: false };
  }
};
