const API_URL = "http://localhost:5000/api";

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
        ? `File:  ${formData.faceImage.name} (${formData.faceImage.size} bytes)`
        : "MISSING ❌",
    });

    // Validation
    if (!formData.faceImage) {
      throw new Error("Face image is missing");
    }

    if (!(formData.faceImage instanceof File)) {
      throw new Error("Face image must be a File object");
    }

    // Create FormData for multipart/form-data
    const data = new FormData();

    // Personal Info (Step 1)
    data.append("full_name", formData.name || "");
    data.append("email", formData.email || "");
    data.append("mobile", formData.mobile || "");
    data.append("dob", formData.dob || "");

    // Password (Step 2)
    data.append("password", formData.password || "");

    // Bank Details (Step 3)
    data.append("bank_name", formData.bankName || "");
    data.append("account_holder_name", formData.accountHolderName || "");
    data.append("account_number", formData.accountNumber || "");
    data.append("ifsc", formData.ifsc || "");

    // Face Image (Step 4) - Must match backend field name
    data.append("face_image", formData.faceImage, formData.faceImage.name);

    // Debug:  Log FormData contents
    console.log("📦 FormData being sent: ");
    for (let [key, value] of data.entries()) {
      if (value instanceof File) {
        console.log(
          `  ${key}: File {name: "${value.name}", size: ${value.size}, type: "${value.type}"}`
        );
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    console.log("🚀 Sending POST request to:", `${API_URL}/auth/register`);

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      body: data,
      // Don't set Content-Type - browser sets it with boundary
    });

    console.log("📥 Response status:", response.status, response.statusText);

    const result = await response.json();

    console.log("📥 Response body:", result);

    if (!response.ok) {
      throw new Error(
        result.message || `Registration failed: ${response.status}`
      );
    }

    console.log("✅ Registration successful! ");
    return result;
  } catch (error) {
    console.error("❌ Registration error:", error);
    throw error;
  }
};

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
