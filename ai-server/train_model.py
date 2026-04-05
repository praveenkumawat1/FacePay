import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
import joblib
import json

def train_face_recognition_model(data_path='data/face_data.json', model_save_path='models/face_recognition_model.pkl', encoder_save_path='models/label_encoder.pkl'):
    """
    Trains a simple SVM classifier based on face descriptors (embeddings).
    """
    print("Starting model training...")
    
    # Check if data exists
    if not os.path.exists(data_path):
        print(f"Error: Data file {data_path} not found.")
        return

    # Load data
    with open(data_path, 'r') as f:
        data = json.load(f)

    X = [] # Face descriptors
    y = [] # User IDs

    for entry in data:
        X.append(entry['face_descriptor'])
        y.append(entry['user_id'])

    X = np.array(X)
    y = np.array(y)

    if len(X) == 0:
        print("Error: No data to train on.")
        return

    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

    # Train SVM Classifier
    # We use probability=True to get confidence scores later
    clf = SVC(kernel='linear', probability=True)
    clf.fit(X_train, y_train)

    # Evaluate
    score = clf.score(X_test, y_test)
    print(f"Model trained successfully. Accuracy: {score * 100:.2f}%")

    # Create models directory if it doesn't exist
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)

    # Save model and encoder
    joblib.dump(clf, model_save_path)
    joblib.dump(le, encoder_save_path)
    print(f"Model saved to {model_save_path}")
    print(f"Encoder saved to {encoder_save_path}")

if __name__ == "__main__":
    # Example usage:
    # Ensure you have a 'data' folder with 'face_data.json' or adjust the path
    train_face_recognition_model()
