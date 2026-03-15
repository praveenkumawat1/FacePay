import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Enroll face during signup
 * @param {string} userId - MongoDB User ID
 * @param {File} faceImageFile - Captured face image file
 * @returns {Promise<Object>}
 */
export const enrollFace = async (userId, faceImageFile) => {
  try {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("faceImage", faceImageFile);

    const response = await axios.post(
      `${API_BASE_URL}/aws-face/enroll`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("❌ Enroll face error:", error);
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
