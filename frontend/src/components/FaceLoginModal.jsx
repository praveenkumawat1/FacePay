import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const videoConstraints = {
  width: 300,
  height: 300,
  facingMode: "user",
};

const FaceLoginModal = ({ close, onSuccess }) => {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFaceLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();

      // Backend API endpoint (adjust if your backend has a different route!)
      const res = await axios.post(
        "/api/auth/login/face",
        { image: imageSrc },
        { headers: { "Content-Type": "application/json" } },
      );

      if (res.data.success && res.data.token) {
        localStorage.setItem("facepay_token", res.data.token);
        localStorage.setItem("facepay_user", JSON.stringify(res.data.user));
        if (onSuccess) onSuccess();
        close();
        window.location.href = "/dashboard";
      } else {
        setError(res.data.message || "Face not recognized. Try again.");
      }
    } catch (e) {
      setError("Face login failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl relative max-w-sm w-full flex flex-col items-center">
        <button
          onClick={close}
          className="absolute top-3 right-4 text-xl text-gray-400 hover:text-gray-600"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Face Login</h2>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="rounded-lg border mb-4"
        />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <button
          onClick={handleFaceLogin}
          className={`w-full py-2 mt-2 rounded bg-lime-500 hover:bg-lime-600 font-bold text-black ${loading ? "opacity-50" : ""}`}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Scan & Login"}
        </button>
      </div>
    </div>
  );
};
export default FaceLoginModal;
