const API_URL = "http://localhost:5000/api";

/**
 * Register user only (NO face enrollment here)
 * Face enrollment is handled separately by awsService.enrollFace
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
    // STEP 1: REGISTER USER ONLY
    // Face enrollment is done separately via awsService
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
    // Face image sent to register endpoint too (optional, for record)
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

    console.log("✅ User registered with ID:", registerResult.user._id);

    // Return just the register result — caller handles face enrollment
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
// COUPONS & REWARDS API
// ============================================

export const getCouponsDashboard = async (token) => {
  try {
    const authToken = token || localStorage.getItem("facepay_token");
    if (!authToken) throw new Error("No authentication token found");

    const response = await fetch(`${API_URL}/coupons/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` },
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

export const getReferralCode = async (token) => {
  try {
    const authToken = token || localStorage.getItem("facepay_token");
    if (!authToken) throw new Error("No authentication token found");

    const response = await fetch(`${API_URL}/coupons/referral-code`, {
      headers: { Authorization: `Bearer ${authToken}` },
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

export default {
  get: getKycStatus,
  post: postKycStep,
};
