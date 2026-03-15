/**
 * Capture face image from video element
 * @param {HTMLVideoElement} videoElement - Video element reference
 * @returns {Promise<File>} - Captured face image as File
 */
export const captureFaceImage = async (videoElement) => {
  return new Promise((resolve, reject) => {
    try {
      if (!videoElement || videoElement.readyState !== 4) {
        reject(new Error("Video not ready"));
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `face_${Date.now()}.jpg`, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            console.log("✅ Face image captured:", {
              name: file.name,
              size: `${(file.size / 1024).toFixed(2)} KB`,
              type: file.type,
            });

            resolve(file);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        "image/jpeg",
        0.95,
      );
    } catch (error) {
      console.error("❌ Error capturing face image:", error);
      reject(error);
    }
  });
};

/**
 * Stop camera stream
 * @param {HTMLVideoElement} videoElement
 */
export const stopCamera = (videoElement) => {
  if (videoElement && videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach((track) => {
      track.stop();
      console.log("🛑 Camera track stopped:", track.kind);
    });
  }
};

/**
 * Start camera stream
 * @param {HTMLVideoElement} videoElement
 */
export const startCamera = async (videoElement) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    });

    if (videoElement) {
      videoElement.srcObject = stream;
      console.log("✅ Camera started");
    }

    return stream;
  } catch (error) {
    console.error("❌ Camera access error:", error);
    throw new Error("Camera access denied. Please allow camera permissions.");
  }
};
