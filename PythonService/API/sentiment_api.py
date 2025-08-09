from flask import Flask, request, jsonify
import pickle
import os
import re
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize stemmer and stopwords
port_stem = PorterStemmer()
stop_words = set(stopwords.words('english'))

# Get absolute paths to model files
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'trained model.sav')
vectorizer_path = os.path.join(script_dir, 'vectorizer.pkl')

# Load model and vectorizer
try:
    model = pickle.load(open(model_path, 'rb'))
    vectorizer = pickle.load(open(vectorizer_path, 'rb'))
    print("Model and vectorizer loaded successfully!")
except Exception as e:
    print(f"Error loading model/vectorizer: {e}")
    raise e

def preprocess_text(text):
    stemmed_content = re.sub('[^a-zA-Z]',' ', text)
    stemmed_content = stemmed_content.lower()
    stemmed_content = stemmed_content.split()
    stemmed_content = [port_stem.stem(word) for word in stemmed_content if not word in stop_words]
    return ' '.join(stemmed_content)

@app.route('/predict', methods=['POST'])
def predict():
    print("Predict endpoint hit!")  # Debug output
    try:
        data = request.get_json()
        print("Received data:", data)  # Debug output
        
        if not data or 'texts' not in data:
            return jsonify({'error': 'Missing texts parameter'}), 400
        
        texts = data['texts']
        processed_texts = [preprocess_text(text) for text in texts]
        X = vectorizer.transform(processed_texts)
        predictions = model.predict(X)
        probabilities = model.predict_proba(X)
        
        results = []
        for text, pred, prob in zip(texts, predictions, probabilities):
            results.append({
                'text': text,
                'sentiment': 'positive' if pred == 1 else 'negative',
                'confidence': float(max(prob))
            })
        
        return jsonify({'results': results})
    
    except Exception as e:
        print("Error in prediction:", str(e))  # Debug output
        return jsonify({'error': str(e)}), 500

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"status": "API is working"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000, debug=True)
