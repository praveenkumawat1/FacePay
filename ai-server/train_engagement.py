import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os
import json
from pymongo import MongoClient
import dotenv

# Load environment variables (e.g., MongoDB URI)
dotenv.load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/facepay")

def fetch_engagement_data():
    """
    Fetches user engagement data from the database.
    In a real-world scenario, you would connect to MongoDB.
    """
    print("Fetching engagement data...")
    # This is a sample placeholder for how you would fetch from Mongo
    # client = MongoClient(MONGO_URI)
    # db = client.get_database()
    # collection = db['engagementlogs']
    # data = list(collection.find({}))
    
    # Placeholder data for training logic demonstration
    sample_data = [
        {"sessionId": "s1", "sectionId": "hero", "dwellTime": 15000, "scrollDepth": 100, "clickCount": 2, "device": "Desktop"},
        {"sessionId": "s1", "sectionId": "features", "dwellTime": 45000, "scrollDepth": 80, "clickCount": 5, "device": "Desktop"},
        {"sessionId": "s2", "sectionId": "hero", "dwellTime": 5000, "scrollDepth": 30, "clickCount": 0, "device": "Mobile"},
        {"sessionId": "s3", "sectionId": "pricing", "dwellTime": 60000, "scrollDepth": 90, "clickCount": 1, "device": "Desktop"},
        {"sessionId": "s4", "sectionId": "features", "dwellTime": 10000, "scrollDepth": 40, "clickCount": 1, "device": "Mobile"},
    ]
    return pd.DataFrame(sample_data)

def train_engagement_model():
    """
    Trains a clustering model to identify user behavior segments (e.g., 'Highly Engaged', 'Quick Exit', 'Pricing Focused').
    """
    print("Starting Engagement Analysis Model Training...")
    
    df = fetch_engagement_data()
    if df.empty:
        print("Error: No engagement data found.")
        return

    # Data Preprocessing: We want to cluster based on time spent, scroll depth, and clicks
    features = ['dwellTime', 'scrollDepth', 'clickCount']
    X = df[features]

    # Scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Simple K-Means Clustering (3 segments: Low, Medium, High Engagement)
    # You can also use this for specific sections like "Which section is most engaging?"
    n_clusters = 3
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    
    # Save the model and scaler
    os.makedirs('models/engagement', exist_ok=True)
    joblib.dump(kmeans, 'models/engagement/engagement_kmeans.pkl')
    joblib.dump(scaler, 'models/engagement/engagement_scaler.pkl')

    print(f"Engagement model trained and saved to models/engagement/")
    
    # Predict and Output Top Performing Sections
    df['cluster'] = kmeans.labels_
    avg_per_section = df.groupby('sectionId')[features].mean().sort_values(by='dwellTime', ascending=False)
    print("\n--- Average User Focus per Section ---")
    print(avg_per_section)

if __name__ == "__main__":
    train_engagement_model()
