from flask import Flask, request, jsonify
import logging
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)   # Enable CORS for all routes


# Configure logging
app.logger.setLevel(logging.DEBUG)  # Set logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
app.logger.addHandler(logging.StreamHandler())  # Add a handler to log to the console

@app.route('/upload-audio', methods=['POST'])
def upload_audio():
    try:
        app.logger.debug('Received an audio upload request')

        uploaded_file = request.files['audio']
        if uploaded_file:
            # Process the uploaded file here (e.g., save it, perform analysis, etc.)
            app.logger.info('Audio file successfully processed')
            return jsonify({"message": "Audio uploaded to Flask successfully"})
        else:
            app.logger.warning('No audio file uploaded')
            return jsonify({"message": "No audio file uploaded"}), 400
    except Exception as e:
        app.logger.error('Error uploading audio: %s', str(e))
        return jsonify({"message": "Error uploading audio", "error": str(e)}), 500

if __name__ == '__main__':
    app.run()
