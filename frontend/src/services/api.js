const API_URL = "http://localhost:5000/api";

/**
 * Register user with face enrollment
 */
export const registerUser = async (formData) => {
  try {
    console.log("📤 registerUser called with:", {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      dob: formData.dob,
      password: "***",
      bankName: formData.bankName,
      accountHolderName: formData.accountHolderName,
      accountNumber: formData.accountNumber,
      ifsc: formData.ifsc,
      faceImage: formData.faceImage
        ? `File: ${formData.faceImage.name} (${formData.faceImage.size} bytes)`
        : "MISSING ❌",
    });

    // ✅ VALIDATION
    if (!formData.faceImage) {
      console.error("❌ Face image is missing!");
      throw new Error("Face image is missing");
    }

    if (!(formData.faceImage instanceof File)) {
      console.error(
        "❌ Face image is not a File object:",
        typeof formData.faceImage,
      );
      throw new Error("Face image must be a File object");
    }

    console.log("✅ Face image validated");

    // ============================================
    // STEP 1: REGISTER USER
    // ============================================
    console.log("📝 Step 1: Registering user...");

    const data = new FormData();
    data.append("full_name", formData.name || "");
    data.append("email", formData.email || "");
    data.append("mobile", formData.mobile || "");
    data.append("dob", formData.dob || "");
    data.append("password", formData.password || "");
    data.append("bank_name", formData.bankName || "");
    data.append("account_holder_name", formData.accountHolderName || "");
    data.append("account_number", formData.accountNumber || "");
    data.append("ifsc", formData.ifsc || "");
    data.append("face_image", formData.faceImage, formData.faceImage.name);

    console.log("🚀 Sending POST request to:", `${API_URL}/auth/register`);

    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      body: data,
    });

    console.log("📥 Register response status:", registerResponse.status);

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error("❌ Register response error:", errorText);
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }

    const registerResult = await registerResponse.json();
    console.log("📥 Register response body:", registerResult);

    if (!registerResult.success) {
      console.error("❌ Registration returned success: false");
      throw new Error(registerResult.message || "Registration failed");
    }

    if (!registerResult.user || !registerResult.user._id) {
      console.error("❌ No user ID in response:", registerResult);
      throw new Error("Registration succeeded but no user ID returned");
    }

    const userId = registerResult.user._id;
    console.log("✅ User registered with ID:", userId);

    // ============================================
    // STEP 2: ENROLL FACE WITH AWS REKOGNITION
    // ============================================
    console.log("🔐 Step 2: Enrolling face with AWS Rekognition...");
    console.log("User ID:", userId);
    console.log("Face Image:", formData.faceImage.name);

    const faceData = new FormData();
    faceData.append("userId", userId);
    faceData.append("faceImage", formData.faceImage, formData.faceImage.name);

    console.log("🚀 Sending POST request to:", `${API_URL}/aws-face/enroll`);

    let enrollResponse;
    try {
      enrollResponse = await fetch(`${API_URL}/aws-face/enroll`, {
        method: "POST",
        body: faceData,
      });

      console.log("📥 Enroll response status:", enrollResponse.status);

      const enrollResult = await enrollResponse.json();
      console.log("📥 Enroll response body:", enrollResult);

      if (!enrollResponse.ok) {
        console.warn("⚠️ Face enrollment failed but user already created");
        console.warn("Error:", enrollResult.message);
        console.warn("Status:", enrollResponse.status);
      } else if (enrollResult.success) {
        console.log("✅ Face enrolled successfully!");
        console.log("Face ID:", enrollResult.data.faceId);
        console.log("Confidence:", enrollResult.data.confidence);

        // Add to result
        registerResult.faceEnrolled = true;
        registerResult.faceId = enrollResult.data.faceId;
        registerResult.faceConfidence = enrollResult.data.confidence;
      } else {
        console.warn("⚠️ Enrollment returned success: false");
        registerResult.faceEnrolled = false;
      }
    } catch (enrollError) {
      console.error("❌ Exception during face enrollment:", enrollError);
      registerResult.faceEnrolled = false;
      registerResult.enrollmentError = enrollError.message;
    }

    console.log("🎉 Registration process completed!");
    return registerResult;
  } catch (error) {
    console.error("❌ Registration error:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  try {
    console.log("🔐 Login attempt for:", email);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login failed");
    }

    console.log("✅ Login successful");
    return result;
  } catch (error) {
    console.error("❌ Login error:", error);
    throw error;
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch profile");
    }

    return result;
  } catch (error) {
    console.error("❌ Profile fetch error:", error);
    throw error;
  }
};

export const getKycStatus = async (token) => {
  const res = await fetch(`${API_URL}/kyc/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const postKycStep = async (endpoint, data, token) => {
  const res = await fetch(`${API_URL}/kyc/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

// ============================================
// ✅ NEW: COUPONS & REWARDS API (ADDED WITHOUT ALTERING EXISTING CODE)
// ============================================

/**
 * Get user's coupon dashboard (coins, streak, marketplace, coupons, referral code)
 * @param {string} token - JWT token (if not provided, it will be read from localStorage)
 */
export const getCouponsDashboard = async (token) => {
  try {
    const authToken = token || localStorage.getItem("facepay_token");
    if (!authToken) throw new Error("No authentication token found");

    const response = await fetch(`${API_URL}/coupons/dashboard`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch dashboard");
    }
    return result;
  } catch (error) {
    console.error("❌ getCouponsDashboard error:", error);
    throw error;
  }
};

/**
 * Claim daily reward (increases streak and adds coins)
 * @param {string} token - JWT token
 */
export const claimDailyReward = async (token) => {
  try {
    const authToken = token || localStorage.getItem("facepay_token");
    if (!authToken) throw new Error("No authentication token found");

    const response = await fetch(`${API_URL}/coupons/claim-daily`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to claim daily reward");
    }
    return result;
  } catch (error) {
    console.error("❌ claimDailyReward error:", error);
    throw error;
  }
};

/**
 * Redeem a marketplace item using coins
 * @param {string} itemId - ID of the item to redeem
 * @param {string} token - JWT token
 */
export const redeemItem = async (itemId, token) => {
  try {
    const authToken = token || localStorage.getItem("facepay_token");
    if (!authToken) throw new Error("No authentication token found");

    const response = await fetch(`${API_URL}/coupons/redeem`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to redeem item");
    }
    return result;
  } catch (error) {
    console.error("❌ redeemItem error:", error);
    throw error;
  }
};

/**
 * Get user's referral code
 * @param {string} token - JWT token
 */
export const getReferralCode = async (token) => {
  try {
    const authToken = token || localStorage.getItem("facepay_token");
    if (!authToken) throw new Error("No authentication token found");

    const response = await fetch(`${API_URL}/coupons/referral-code`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch referral code");
    }
    return result;
  } catch (error) {
    console.error("❌ getReferralCode error:", error);
    throw error;
  }
};

/**
 * Apply a referral code when registering (or after registration)
 * @param {string} code - Referral code to apply
 * @param {string} token - JWT token
 */
export const applyReferralCode = async (code, token) => {
  try {
    const authToken = token || localStorage.getItem("facepay_token");
    if (!authToken) throw new Error("No authentication token found");

    const response = await fetch(`${API_URL}/coupons/apply-referral`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to apply referral code");
    }
    return result;
  } catch (error) {
    console.error("❌ applyReferralCode error:", error);
    throw error;
  }
};

// Original default export (unchanged)
export default {
  get: getKycStatus,
  post: postKycStep,
};
