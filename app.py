from flask import Flask, request, jsonify
from PIL import Image
import torch
from torchvision import transforms
from torchvision.models import resnet18, ResNet18_Weights
import joblib
from flask_cors import CORS
import numpy as np
import os

app = Flask(__name__)
CORS(app)
# Load model and scaler once when the app starts
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

rf_model = joblib.load("global_rf.pkl")
scaler = joblib.load("scaler.pkl")

# Setup ResNet18
model = resnet18(weights=ResNet18_Weights.DEFAULT)
model.fc = torch.nn.Identity()
model = model.to(DEVICE).eval()

# Preprocessing transform
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image_file = request.files['image']
        image = Image.open(image_file).convert("RGB")
        image = transform(image).unsqueeze(0).to(DEVICE)

        # Feature extraction
        with torch.no_grad():
            features = model(image)
        features = features.cpu().numpy()

        # Scale and select top 20 features
        features_scaled = scaler.transform(features)
        fixed_features = features_scaled[0, :20].reshape(1, -1)

        # Predict using RF
        prediction = rf_model.predict(fixed_features)[0]
        label = "Pneumonia" if prediction == 1 else "Normal"

        return jsonify({"prediction": label})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
