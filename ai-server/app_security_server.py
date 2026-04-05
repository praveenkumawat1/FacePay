import cv2
import numpy as np
import base64
import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
import joblib

app = Flask(__name__)
CORS(app)

# Load existing models
try:
    liveness_model = joblib.load('models/face_recognition_model.pkl')
    engagement_model = joblib.load('models/engagement/engagement_kmeans.pkl')
except:
    liveness_model = None
    engagement_model = None

@app.route('/analyze-frame', methods=['POST'])
def analyze_frame():
    """
    Analyzes periodic frames for security threats or impersonation.
    """
    print(f"[{time.ctime()}] Image analysis request received...")
    data = request.json
    try:
        img_data = data.get('image', '').split(',')[1] # Decode base64
        user_id = data.get('userId', 'anonymous')
        
        nparr = np.frombuffer(base64.b64decode(img_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            print("ERROR: Could not decode image")
            return jsonify({"status": "failed", "error": "Invalid image"}), 400
            
        print(f"Decoded {img.shape[1]}x{img.shape[0]} image for User: {user_id}")
    except Exception as e:
        print(f"CATCH ERROR: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

    # Simple Check: Is there a face?
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    threat_level = "LOW"
    details = []

    if len(faces) == 0:
        threat_level = "CRITICAL"
        details.append("User not in front of camera")
    elif len(faces) > 1:
        threat_level = "HIGH"
        details.append(f"Multiple people detected: {len(faces)}")
    else:
        # Check for eyes (Liveness indicator)
        (x, y, w, h) = faces[0]
        roi_gray = gray[y:y+h, x:x+w]
        eyes = eye_cascade.detectMultiScale(roi_gray)
        if len(eyes) < 2:
            threat_level = "MEDIUM"
            details.append("Possible mask or face obstruction detected")

    # Log to a text file for auditing
    with open("logs/security/audit_log.txt", "a") as f:
        f.write(f"{time.ctime()} - User: {user_id} - Threat: {threat_level} - Details: {details}\n")

    # Save anonymously for later analysis
    log_path = f"logs/security/{user_id}/{int(time.time())}.jpg"
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    cv2.imwrite(log_path, img)

    return jsonify({"status": "captured", "threat_level": threat_level, "details": details})

@app.route('/voice-analyze', methods=['POST'])
def voice_analyze():
    """
    Analyzes background voice for suspicious keywords.
    """
    file = request.files['audio']
    recognizer = sr.Recognizer()
    with sr.AudioFile(file) as source:
        audio_data = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio_data)
            # Match keywords (example)
            suspicious = ["hack", "password", "withdraw", "admin"]
            found = [word for word in suspicious if word in text.lower()]
            return jsonify({"status": "processed", "detected_words": found})
        except:
            return jsonify({"status": "no_voice_detected"})

if __name__ == '__main__':
    app.run(port=5001, debug=True)
