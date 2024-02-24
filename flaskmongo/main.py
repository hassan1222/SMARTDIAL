from bson import Binary, ObjectId
from flask import Flask, request, jsonify, render_template, send_file,Response, make_response
from collections import Counter
from flask_pymongo import PyMongo
import subprocess
from pymongo import DESCENDING
from gridfs import GridFS
import tempfile
from io import BytesIO
import base64
import pymongo
import math
from werkzeug.utils import secure_filename
import openpyxl
import whisper
import pandas as pd
import io 
import soundfile as sf
from skimage.transform import resize
import torch
from pydub import AudioSegment
import pyannote.audio
from pyannote.audio.pipelines.speaker_verification import PretrainedSpeakerEmbedding
from pyannote.audio import Audio
from pyannote.core import Segment
import matplotlib.pyplot as plt
import wave
import contextlib
from sklearn.cluster import AgglomerativeClustering
import numpy as np
from datetime import datetime
from flask_cors import CORS
import os
import joblib
import nltk
import base64
from nltk import sent_tokenize
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from keras.preprocessing import sequence
from tensorflow.keras.models import load_model
import nltk
import pickle
import magic
import tensorflow as tf
from nltk.stem import WordNetLemmatizer
tf.config.run_functions_eagerly(True)
nltk.download('stopwords')
from tensorflow.keras.preprocessing.text import Tokenizer
from nltk.corpus import stopwords
import pickle
from keras.models import load_model
import librosa
import numpy as np
from scipy.signal import resample
import io
from scipy.io.wavfile import write
from flask import send_from_directory
import shutil
import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import re
from flask import send_file
import string
from queue import Queue
import matplotlib.pyplot as plt
from openpyxl import Workbook
from openpyxl.chart import LineChart
from openpyxl.utils.dataframe import dataframe_to_rows
from openpyxl.drawing.image import Image
from flask_pymongo import PyMongo
from plotly.subplots import make_subplots
import plotly.graph_objects as go
from gridfs import GridFS
from bson import ObjectId
import json 
from bson.json_util import dumps
from datetime import datetime
import base64
from bson import ObjectId

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb+srv://admin:hassan@cluster0.vowocd1.mongodb.net/customer?retryWrites=true&w=majority"
mongo = PyMongo(app)
CORS(app)
fs = GridFS(mongo.db)
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

# Load the trained model
model = load_model("hate&tokenizer.h5")

# Load the tokenizer
with open('tokenizer.pickle', 'rb') as handle:
    tokenizer = pickle.load(handle)
max_len = 300

pipeline_file = open("text_emotion.pkl", "rb")
loaded_pipeline = joblib.load(pipeline_file)
pipeline_file.close()

nltk.download('punkt')

model1 = load_model('sarcasm_mod2.h5')
max_tokes=11

# Load the tokenizer
with open('tokeni.pkl', 'rb') as tokenizer_file:
    tokeni = pickle.load(tokenizer_file)
    
UPLOAD_FOLDER = 'uploads'
SEGMENT_FOLDER = 'segments'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SEGMENT_FOLDER'] = SEGMENT_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(SEGMENT_FOLDER):
    os.makedirs(SEGMENT_FOLDER)

ALLOWED_EXTENSIONS = {'wav'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def segment_audio(input_path, output_folder, segment_duration=2):
    audio = AudioSegment.from_wav(input_path)
    segment_length = segment_duration * 1000  # Convert to milliseconds
    segments = [audio[i:i+segment_length] for i in range(0, len(audio), segment_length)]
    print("Total audio duration:", len(audio) / 1000, "seconds")
    
    for i, segment in enumerate(segments):
        segment.export(os.path.join(output_folder, f'segment_{i}.wav'), format='wav')
        segment_start = i * segment_duration
        segment_end = segment_start + segment_duration
        print(f"Segment {i}: Start {segment_start:.2f} seconds, End {segment_end:.2f} seconds")

loaded_model = load_model('emotion_det_model.h5')
FRAME_LENGTH = 2048
HOP_LENGTH = 512
emotion_labels = ['neutral', 'happy', 'sad', 'angry', 'fear', 'disgust']

def preprocess_audio_for_prediction(path):
    samples, sr = librosa.load(path, sr=None)
    
    # Resample the audio to a consistent sampling rate
    target_sr = 16000
    samples_resampled = librosa.resample(samples, orig_sr=sr, target_sr=target_sr)

    # Trim and pad the resampled audio
    trimmed, _ = librosa.effects.trim(samples_resampled, top_db=25)
    padded = np.pad(trimmed, (0, 180000 - len(trimmed)), 'constant')

    zcr = librosa.feature.zero_crossing_rate(padded, frame_length=FRAME_LENGTH, hop_length=HOP_LENGTH)
    rms = librosa.feature.rms(y=padded, frame_length=FRAME_LENGTH, hop_length=HOP_LENGTH)
    mfccs = librosa.feature.mfcc(y=padded, sr=target_sr, n_mfcc=13, hop_length=HOP_LENGTH)

    zcr_list = np.swapaxes(zcr, 0, 1)
    rms_list = np.swapaxes(rms, 0, 1)
    mfccs_list = np.swapaxes(mfccs, 0, 1)

    X_input = np.concatenate((zcr_list, rms_list, mfccs_list), axis=1)
    X_input = X_input.astype('float32')

    return X_input

saved_model_path = 'speaker.h5'  # Full path
label_encoder_path = 'label_encoder.pkl'

modelspeaker = load_model(saved_model_path)
target_sample_rate = 22050
# Load the label encoder
label_encoder = joblib.load(label_encoder_path)
# Define the 'segment' function before using it

def predict_audio(segment_path):
    try:
        segment_np, _ = librosa.load(segment_path, sr=target_sample_rate, mono=True, dtype=np.float32)

        # Extract features from the audio data
        spectrogram = librosa.stft(segment_np, n_fft=256, hop_length=128)
        spectrogram_real = np.abs(spectrogram)
        spectrogram_real = spectrogram_real[:, :, None]
        spectrogram_real = resize(spectrogram_real, (128, 64), mode='constant', cval=0.0)
        spectrogram_real = np.expand_dims(spectrogram_real, -1)
        spectrogram_real = np.reshape(spectrogram_real, (1, 128, 64, 1))  # Add a batch dimension

        # Make a prediction using the loaded model
        prediction = modelspeaker.predict(spectrogram_real)

        # Get the predicted label and probability
        predicted_label_encoded = np.argmax(prediction, axis=1)
        predicted_label = label_encoder.inverse_transform(predicted_label_encoded)
        predicted_probability = float(np.max(prediction))  # Convert to Python float

        prediction_data = {
            'predicted_label': predicted_label[0],
            'predicted_probability': predicted_probability
        }

        return prediction_data
    except Exception as e:
        error_message = str(e)
        return {'error': error_message}

def create_dynamic_line_plot(df, segment_duration):
    fig = make_subplots(rows=1, cols=1, shared_xaxes=True, subplot_titles=["Emotion Prediction Over Time"])

    for emotion in df['Predicted Emotions'].unique():
        emotion_df = df[df['Predicted Emotions'] == emotion]
        fig.add_trace(go.Scatter(x=emotion_df['Segment Start Time (s)'],
                                 y=[emotion] * len(emotion_df),
                                 mode='lines+markers',
                                 name=emotion))

    fig.update_layout(title_text='Emotion Prediction Over Time',
                      xaxis_title='Segment Start Time (s)',
                      yaxis_title='Emotion',
                      legend_title='Emotions',
                      height=600,
                      width=800)

    plot_image_path = 'emotion_prediction_plot.png'
    fig.write_image(plot_image_path, format='png')

    return plot_image_path

audio_folder = r'D:\SmartDial1\smartdialfyp\flaskmongo\uploadrecording\Hassan Shahzad'
latest_audio_path = [None]  # Use a list to store the latest audio path

class AudioHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            if event.src_path.endswith(('.mp3', '.wav', '.ogg', '.flac')):
                latest_audio_path[0] = event.src_path
                print(f"New audio file: {latest_audio_path[0]}")

observer = Observer()
event_handler = AudioHandler()
observer.schedule(event_handler, path=audio_folder, recursive=False)
observer.start()

audios_folder = os.path.join(os.getcwd(), 'audios')

# Ensure the audios folder exists
os.makedirs(audios_folder, exist_ok=True)

def sanitize_filename(name):
    # Replace spaces with underscores and remove other special characters
    cleaned_name = re.sub(r'[^\w\s.-]', '', name)
    return cleaned_name + '.wav'

@app.route("/")
def index():
    return "Hello, Flask app is running!"
@app.route('/save_call_percentages', methods=['POST'])
def save_call_percentages():
    try:
        data = request.json
        employee_id = data.get('employeeId')
        call_percentages = data.get('callPercentages')

        # Create a list to store call percentages
        call_percentages_list = []

        # Iterate through call percentages and append to the list
        for call_data in call_percentages:
            call_number = call_data.get('callNumber')
            percentage = call_data.get('percentage')
            
            call_percentages_list.append({
                'callNumber': call_number,
                'percentage': percentage
            })

        # Insert the data into MongoDB as a single document
        mongo.db.call_percentages.insert_one({
            'employeeId': employee_id,
            'callPercentages': call_percentages_list
        })

        return jsonify({'message': 'Call percentages saved successfully'})

    except Exception as e:
        print(f'Error saving call percentages: {str(e)}')
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/get_latest_call_percentages', methods=['GET'])
def get_latest_call_percentages():
    try:
        # Find the latest document from the entire collection
        latest_document = mongo.db.call_percentages.find_one(
            sort=[('_id', -1)]  # Sort by _id in descending order to get the latest document first
        )

        if latest_document:
            # Convert ObjectId to string for JSON serialization
            latest_document['_id'] = str(latest_document['_id'])
            return jsonify(latest_document)
        else:
            return jsonify({'message': 'No call percentages found'}), 404

    except Exception as e:
        print(f'Error fetching latest call percentages: {str(e)}')
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/get_image/<image_filename>', methods=['GET'])
def get_image(image_filename):
    try:
        # Assuming 'graph' is the folder where images are stored
        image_path = os.path.join(os.getcwd(), 'graph', image_filename)

        # Use Flask's send_file to send the image in the response
        return send_file(image_path, mimetype='image/jpeg')

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/get_predictions_for_employee_by_name/<employee_name>', methods=['GET'])
def get_predictions_for_employee_by_name(employee_name):
    print(f"Fetching predictions for employee: {employee_name}")
    try:
        # Assuming date is passed as a query parameter (e.g., /get_predictions_for_employee_by_name/John%20Doe?date=2023-01-01)
        date_str = request.args.get('date')
        if date_str:
            date = datetime.strptime(date_str, '%Y-%m-%d')
        else:
            date = datetime.now()

        collection = mongo.db.reportpredictions
        # Use the correct fields for filtering (assuming 'name' and 'timestamp' are the fields in your MongoDB collection)
        employee_predictions = list(collection.find({
            'name': employee_name,
            'timestamp': {'$lte': date.isoformat()}  # Fetch predictions until the specified date
        }, {'_id': 0}))

        if employee_predictions:
            return jsonify({'predictions': employee_predictions})
        else:
            return jsonify({'message': f'No predictions found for employee {employee_name} on {date}'}), 404

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/predictions_for_employee_by_name/<employee_name>', methods=['GET'])
def predictions_for_employee_by_name(employee_name):
    print(f"Fetching predictions for employee: {employee_name}")
    try:
        # Assuming start_date and end_date are passed as query parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')

        # Use datetime.strptime to convert date strings to datetime objects
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')

        collection = mongo.db.reportpredictions
        # Use the correct fields for filtering (assuming 'name' and 'timestamp' are the fields in your MongoDB collection)
        employee_predictions = list(collection.find({
            'name': employee_name,
            'timestamp': {'$gte': start_date.isoformat(), '$lte': end_date.isoformat()}  
            # Fetch predictions between start_date and end_date (inclusive)
        }, {'_id': 0}))

        if employee_predictions:
            return jsonify({'predictions': employee_predictions})
        else:
            return jsonify({'message': f'No predictions found for employee {employee_name} between {start_date} and {end_date}'}), 404

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
            
@app.route('/get_all_predictions', methods=['GET'])
def get_all_predictions():
    try:
        collection = mongo.db.reportpredictions
        # Retrieve all documents in the collection
        all_predictions = list(collection.find({}, {'_id': 0}))

        if all_predictions:
            return jsonify({'predictions': all_predictions})
        else:
            return jsonify({'message': 'No predictions found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/save_image', methods=['POST'])
def save_image():
    try:
        # Check if the 'image' key is present in the files
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided in the request'}), 400

        image_file = request.files['image']

        # Ensure the file has an allowed extension (optional but recommended)
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
        if '.' in image_file.filename and image_file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            return jsonify({'error': 'Invalid file format'}), 400

        # Create the 'graph' folder if it doesn't exist in the current working directory
        graph_folder_path = os.path.join(os.getcwd(), 'graph')
        os.makedirs(graph_folder_path, exist_ok=True)

        # Generate a unique filename based on the current timestamp (up to minutes)
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M')
        image_filename = f'emotion-chart_{timestamp}.jpg'
        image_path = os.path.join(graph_folder_path, image_filename)

        # Save the image to the 'graph' folder
        image_file.save(image_path)

        return jsonify({'imagePath': image_path, 'timestamp': timestamp})

    except Exception as e:
        # Log the exception for debugging
        print(f"Error saving image: {e}")

        # Return a more informative error response
        return jsonify({'error': f'Internal Server Error: {str(e)}'}), 500

@app.route('/save_predictions_with_image', methods=['POST'])
def save_predictions_with_image():
    try:
        data = request.get_json()

        name = data.get('name')
        sarcasm_predictions = data.get('sarcasm_predictions', [])
        hate_speech_predictions = data.get('hate_speech_predictions', [])
        emotions = data.get('emotions', [])
        chart_data = data.get('chartData', [])
        image_path = data.get('imagePath', '')
        timestamp = data.get('timestamp', '')

        collection = mongo.db.reportpredictions
        prediction_data = {
            'name': name,
            'sarcasm_predictions': sarcasm_predictions,
            'hate_speech_predictions': hate_speech_predictions,
            'emotions': emotions,
            'chart_data': chart_data,
            'image_path': image_path,
            'timestamp': timestamp,
        }
        collection.insert_one(prediction_data)

        return jsonify({'message': 'Data saved successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_targeted_calls', methods=['GET'])
def get_targeted_calls():
    try:
        # Retrieve targeted calls from MongoDB
        result = mongo.db.target.find_one({}, {'_id': 0, 'targeted_calls': 1})

        if not result:
            return jsonify({'error': 'Targeted calls not found'}), 404

        targeted_calls = result.get('targeted_calls', 0)

        return jsonify({'targeted_calls': targeted_calls}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/save_targeted_calls', methods=['POST'])
def save_targeted_calls():
    try:
        data = request.get_json()

        if 'targeted_calls' not in data:
            return jsonify({'error': 'Targeted calls not provided'}), 400

        targeted_calls = int(data['targeted_calls'])

        # Save to MongoDB
        mongo.db.target.insert_one({'targeted_calls': targeted_calls})

        return jsonify({'message': 'Targeted calls saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload_all_audios', methods=['GET'])
def upload_all_audios():
    # Check if the folder exists
    if not os.path.exists(audios_folder):
        return jsonify({"error": "Audio folder not found"}), 404

    try:
        # Loop through files in the folder
        for filename in os.listdir(audios_folder):
            if filename.endswith(('.mp3', '.wav')):
                file_path = os.path.join(audios_folder, filename)

                # Split the filename into firstname and lastname
                firstname, lastname_with_extension = filename.split(" ", 1)

                # Remove the file extension from the lastname
                lastname = os.path.splitext(lastname_with_extension)[0]

                # Open the audio file and read its content
                with open(file_path, "rb") as audio_file:
                    # Insert the audio file into MongoDB with firstname and lastname
                    result = mongo.db.audcollection.insert_one({
                        "firstname": firstname,
                        "lastname": lastname,
                        "audio_data": audio_file.read()
                    })

                print(f"Uploaded {filename} to MongoDB. Document ID: {result.inserted_id}")

        return jsonify({"message": "All audio files uploaded successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_latest_audio', methods=['GET'])
def get_latest_audio():
    try:
        # Retrieve the latest document from MongoDB
        latest_audio = mongo.db.audcollection.find_one(sort=[('_id', -1)])

        if latest_audio:
            # Return the latest audio data as a file
            audio_data = latest_audio.get("audio_data", b"")
            response = send_file(io.BytesIO(audio_data), mimetype="audio/wav")
            response.headers["Content-Disposition"] = "attachment; filename=latest_audio.wav"
            return response
        else:
            return jsonify({"message": "No audio data found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/get_late', methods=['GET'])
def get_late():
    try:
        # Retrieve the latest document from MongoDB
        latest_audio = mongo.db.audcollection.find_one(sort=[('_id', -1)])

        if latest_audio:
            # Extract firstname, lastname, and audio data
            firstname = latest_audio.get("firstname", "")
            lastname = latest_audio.get("lastname", "")

            # Return the latest audio data along with firstname and lastname
            response = {
                "firstname": firstname,
                "lastname": lastname,
            }

            return jsonify(response)
        else:
            return jsonify({"message": "No audio data found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/delete_latest_audio', methods=['DELETE'])
def delete_latest_audio():
    try:
        # Find the document with the latest insertion timestamp
        latest_audio = mongo.db.audcollection.find_one(
            {}, sort=[('_id', pymongo.DESCENDING)]
        )

        if latest_audio:
            # Get the ID of the latest audio document
            audio_id = latest_audio['_id']

            # Delete the latest audio document by its ID
            result = mongo.db.audcollection.delete_one({'_id': audio_id})

            if result.deleted_count > 0:
                return jsonify({"message": "Latest audio deleted successfully"})
            else:
                return jsonify({"error": "Failed to delete latest audio"}), 500
        else:
            return jsonify({"error": "No audio files found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/register_audio', methods=['POST'])
def register_audio():
    try:
        # Get the uploaded audio file from the request
        audio_file = request.files['audio']

        # Get the name and sanitize the filename
        name = request.form['name']
        filename = sanitize_filename(name)
        file_path = os.path.join(audios_folder, filename)

        # Save the audio file
        audio_file.save(file_path)

        # You can perform additional processing or database operations here

        return {'status': 'success', 'message': 'Audio registered successfully'}
    except Exception as e:
        print("Error:", str(e))
        return {'status': 'error', 'message': 'Error registering audio'}, 500
@app.route('/practice', methods=['POST'])
def upload_audioa():
    try:
        heading = request.form.get('heading')
        audio_file = request.files['audio']

        # Save audio file to MongoDB
        audio_data = {
            'heading': heading,
            'audio': audio_file.read()
        }
        mongo.db.practice_collection.insert_one(audio_data)

        return jsonify({'message': 'Audio uploaded successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/processaud', methods=['POST'])
def process_audiooo():
    try:
        # Check if the 'audio' file is present in the request
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']

        # Save the audio file to MongoDB
        audio_id = mongo.db.audiofiles.insert_one({
            'filename': audio_file.filename,
            'data': audio_file.read()
        }).inserted_id

        return jsonify({'message': 'Audio file successfully saved to MongoDB', 'audio_id': str(audio_id)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/practicee', methods=['GET'])
def get_all_audioo():
    try:
        audio_data = mongo.db.practice_collection.find({}, {'_id': 0})
        audio_list = list(audio_data)

        # Convert audio bytes to base64-encoded strings
        for item in audio_list:
            if 'audio' in item:
                item['audio'] = base64.b64encode(item['audio']).decode('utf-8')

        return jsonify(audio_list), 200

    except Exception as e:
        print({'error': str(e)})
        return jsonify({'error': str(e)}), 500
    
@app.route('/helpemp', methods=['POST'])
def save_helpemp_data():
    data = request.form
    heading = data.get('heading')
    text = data.get('text')

    # Save data to MongoDB
    helpemp_data = {
        'heading': heading,
        'text': text,
    }
    mongo.db.helpemp_collection.insert_one(helpemp_data)

    return jsonify({'message': 'Data saved successfully'})

@app.route('/recordv', methods=['POST'])
def save_recordv_data():
    data = request.form
    heading = data.get('heading')
    text = data.get('text')

    # Save data to MongoDB
    recordv_data = {
        'heading': heading,
        'text': text,
    }
    mongo.db.recordv_collection.insert_one( recordv_data )

    return jsonify({'message': 'Data saved successfully'})

@app.route('/gener', methods=['POST'])
def save_gener_data():
    data = request.form
    heading = data.get('heading')
    text = data.get('text')

    # Save data to MongoDB
    recordv_data = {
        'heading': heading,
        'text': text,
    }
    mongo.db.gener.insert_one( recordv_data )

    return jsonify({'message': 'Data saved successfully'})

@app.route('/helpempp', methods=['GET'])
def get_helpemp_data():
    # Retrieve all documents from the helpemp_collection
    helpemp_data = list(mongo.db.helpemp_collection.find({}, {'_id': 0}))

    # Convert ObjectId to string for JSON serialization
    for entry in helpemp_data:
        entry['gif_file_path'] = str(entry.get('gif_file_path', ''))

    return jsonify(helpemp_data)

@app.route('/disgenerate', methods=['GET'])
def get_disgenerate_data():
    # Retrieve all documents from the helpemp_collection
    helpemp_data = list(mongo.db.gener.find({}, {'_id': 0}))

    # Convert ObjectId to string for JSON serialization
    for entry in helpemp_data:
        entry['gif_file_path'] = str(entry.get('gif_file_path', ''))

    return jsonify(helpemp_data)

@app.route('/disrecord', methods=['GET'])
def get_disrecord_data():
    # Retrieve all documents from the helpemp_collection
    helpemp_data = list(mongo.db.recordv_collection.find({}, {'_id': 0}))

    # Convert ObjectId to string for JSON serialization
    for entry in helpemp_data:
        entry['gif_file_path'] = str(entry.get('gif_file_path', ''))

    return jsonify(helpemp_data)

    
@app.route('/save_pdf', methods=['POST'])
def save_pdf():
    data = request.json
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    pdf_data = data.get('pdfData')

    try:
        # Save data to MongoDB including the base64-encoded PDF content
        pdf_entry = {
            'firstName': first_name,
            'lastName': last_name,
            'pdfData': pdf_data
        }
        mongo.db.pdf_collection.insert_one(pdf_entry)

        return jsonify({"message": "PDF data saved successfully"}), 200

    except Exception as e:
        error_message = f"Error: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/get_all_pdfs', methods=['GET'])
def get_all_pdfs():
    try:
        # Retrieve all PDF documents from MongoDB
        pdf_documents = mongo.db.pdf_collection.find({}, {'_id': 0, 'firstName': 1, 'lastName': 1, 'pdfData': 1})

        pdf_list = []
        for pdf_document in pdf_documents:
            pdf_list.append(pdf_document)

        return jsonify({"pdfList": pdf_list}), 200

    except Exception as e:
        error_message = f"Error: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500

    
@app.route('/latestaudio', methods=['GET'])
def latestaudio():
    if latest_audio_path[0]:
        return send_file(latest_audio_path[0], as_attachment=True)
    else:
        return jsonify({"message": "No new audio files "})

    

@app.route('/uploadaud', methods=['POST'])
def uploadaud():
    if 'audio' not in request.files:
        return "No file part"
    file = request.files['audio']
    
    if file.filename == '':
        return "No selected file"
    
    if file:
        filename = file.filename
        file.save(os.path.join('uploadsaudio', filename))  # Save the uploaded audio file to a folder named 'uploadsaudio'
        
        # Segment the audio
        audio = AudioSegment.from_wav(os.path.join('uploadsaudio', filename))
        duration = len(audio)
        segment_length = 1000  # 1 second (in milliseconds)

        for i in range(0, duration, segment_length):
            segment = audio[i:i + segment_length]
            segment.export(os.path.join('segmentation', f'{i//segment_length}.wav'), format='wav')
        
        return "Audio segmentation complete"
@app.route('/upload_and_predict', methods=['POST'])
def upload_and_predict():
    try:
        # Get the uploaded audio file from the reques
        audio_file = request.files.get('audio')

        # Check if the audio file exists
        if not audio_file:
            return jsonify({'error': 'No audio file provided'}), 400

        # Create a temporary directory to store temporary WAV files
        with tempfile.TemporaryDirectory() as temp_dir:
            # Initialize a list to store speaker predictions
            predictions = []

            # Save the uploaded audio file to a temporary WAV file
            audio_path = os.path.join(temp_dir, 'temp_audio.wav')
            audio_file.save(audio_path)

            # Load the temporary WAV file
            audio = AudioSegment.from_file(audio_path)

            # Calculate the total duration of the audio in seconds
            total_duration_seconds = len(audio) / 1000  # Convert milliseconds to seconds
            # Segment the audio into 1-second chunks
            segment_length = 1000 # 1 second in milliseconds
            for i, start_time in enumerate(range(0, len(audio), segment_length)):
                segment = audio[start_time:start_time + segment_length]

                # Save the segment as a temporary WAV file
                segment_path = os.path.join(temp_dir, f'{i}.wav')
                segment.export(segment_path, format='wav')

                # Use the predict_audio function to get predictions for the segment
                prediction_data = predict_audio(segment_path)
                predictions.append(prediction_data)
            

            # Create a folder to save segmented audio for each speaker
            output_folder = os.path.join('output_audio')
            os.makedirs(output_folder, exist_ok=True)

            # Save each segment to a folder named after the predicted speaker
            for i, prediction_data in enumerate(predictions):
                predicted_speaker = prediction_data.get('predicted_label', 'unknown_speaker')
                speaker_folder = os.path.join(output_folder, predicted_speaker)
                os.makedirs(speaker_folder, exist_ok=True)

                segment_path = os.path.join(temp_dir, f'{i}.wav')
                output_path = os.path.join(speaker_folder, f'{i}.wav')

                # Copy the file instead of moving it
                shutil.copy(segment_path, output_path)
                
            return jsonify({'predictions': predictions, 'total_duration_seconds': total_duration_seconds})

    except Exception as e:
        error_message = str(e)
        print("Error:", error_message)
        return jsonify({'error': error_message}), 500

@app.route('/join_segments', methods=['GET'])
def join_segments():
    # Define the path to the "output_audio" directory
    output_audio_path = 'output_audio/Hassan Shahzad'

    # List the WAV files in the "Hassan Shahzad" folder
    wav_files = [f for f in os.listdir(output_audio_path) if f.endswith('.wav')]

    if not wav_files:
        return "No WAV files found in 'Hassan Shahzad' folder"

    # Sort the WAV files in ascending order based on their names
    wav_files.sort(key=lambda x: int(x.split('.')[0]))

    # Create a list to store the segments
    segments = []

    # Load each WAV file in ascending order and append it to the segments list
    for wav_file in wav_files:
        segment = AudioSegment.from_wav(os.path.join(output_audio_path, wav_file))
        segments.append(segment)

    # Concatenate the segments to create the final audio
    final_audio = AudioSegment.empty()
    for segment in segments:
        final_audio += segment

    # Export the final audio to a file
    final_audio.export(os.path.join('uploadsaudio', 'final_audio.wav'), format='wav')

    # Provide a download link for the final audio
    return send_from_directory('uploadsaudio', 'final_audio.wav', as_attachment=True)

@app.route('/join_segmen', methods=['GET'])
def join_segmen():
    # Define the path to the "output_audio" directory
    output_audio_path = 'output_audio/Saleh Sammi'

    # List the WAV files in the "Hassan Shahzad" folder
    wav_files = [f for f in os.listdir(output_audio_path) if f.endswith('.wav')]

    if not wav_files:
        return "No WAV files found in 'Hassan Shahzad' folder"
    # Sort the WAV files in ascending order based on their names
    wav_files.sort(key=lambda x: int(x.split('.')[0]))

    # Create a list to store the segments
    segments = []

    # Load each WAV file in ascending order and append it to the segments list
    for wav_file in wav_files:
        segment = AudioSegment.from_wav(os.path.join(output_audio_path, wav_file))
        segments.append(segment)

    # Concatenate the segments to create the final audio
    final_audio = AudioSegment.empty()
    for segment in segments:
        final_audio += segment

    # Export the final audio to a file
    final_audio.export(os.path.join('uploadsaudio', 'Saleh_audio.wav'), format='wav')

    # Provide a download link for the final audio
    return send_from_directory('uploadsaudio', 'Saleh_audio.wav', as_attachment=True)

@app.route('/segmentaud', methods=['POST'])
def predict_speaker():
    try:
        # Get the uploaded audio file from the request
        audio_file = request.files['audio']

        # Check if the audio file exists
        if not audio_file:
            return jsonify({'error': 'No audio file provided'}), 400

        # Save the uploaded audio file to a temporary location
        audio_path = 'temp_audio.wav'
        audio_file.save(audio_path)

        # Load the audio file using PyDub
        audio = AudioSegment.from_wav(audio_path)

        # Initialize an empty list to store the 1-second segments
        segments = []

        # Segment the audio into 1-second chunks
        segment_length = 1000  # 1 second in milliseconds
        for i in range(0, len(audio), segment_length):
            segment = audio[i:i + segment_length]
            segments.append(segment)

        # Save the segments to MongoDB
        for i, segment in enumerate(segments):
            segment_data = {
                'segment_number': i + 1,
                'duration_ms': segment_length,
                'audio_data': segment.raw_data
            }
            mongo.db.voicelog.insert_one(segment_data)

        # Return the number of segments and their duration in milliseconds
        result = {
            'segments_count': len(segments),
            'segment_duration_ms': segment_length
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up: Remove the temporary audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)
@app.route('/process_audio', methods=['POST'])
def process_audio():
    try:
        # Get the uploaded audio file from the request
        audio_file = request.files['audio']

        # Check if the audio file exists
        if not audio_file:
            return jsonify({'error': 'No audio file provided'}), 400

        # Create a temporary directory to store temporary WAV files
        with tempfile.TemporaryDirectory() as temp_dir:
            # Initialize a list to store speaker predictions
            predictions = []

            # Save the uploaded audio file to a temporary WAV file
            audio_path = os.path.join(temp_dir, 'temp_audio.wav')
            audio_file.save(audio_path)

            # Load the temporary WAV file
            audio = AudioSegment.from_file(audio_path)

            # Calculate the total duration of the audio in seconds
            total_duration_seconds = len(audio) / 1000  # Convert milliseconds to seconds

            # Segment the audio into 1-second chunks
            segment_length = 1000  # 1 second in milliseconds
            segments = []
            for i, start_time in enumerate(range(0, len(audio), segment_length)):
                segment = audio[start_time:start_time + segment_length]

                # Save the segment as a temporary WAV file
                segment_path = os.path.join(temp_dir, f'segment_{i}.wav')
                segment.export(segment_path, format='wav')

                segments.append(segment_path)

            # Process all segments and store predictions in a single document
            combined_predictions = []

            for i, segment_path in enumerate(segments):
                segment_np, _ = librosa.load(segment_path, sr=target_sample_rate, mono=True, dtype=np.float32)

                # Extract features from the audio data
                spectrogram = librosa.stft(segment_np, n_fft=256, hop_length=128)
                spectrogram_real = np.abs(spectrogram)
                spectrogram_real = spectrogram_real[:, :, None]
                spectrogram_real = resize(spectrogram_real, (128, 64), mode='constant', cval=0.0)
                spectrogram_real = np.expand_dims(spectrogram_real, -1)
                spectrogram_real = np.reshape(spectrogram_real, (1, 128, 64, 1))  # Add batch dimension

                # Make a prediction using the loaded model
                prediction = modelspeaker.predict(spectrogram_real)

                # Get the predicted label and probability
                predicted_label_encoded = np.argmax(prediction, axis=1)
                predicted_label = label_encoder.inverse_transform(predicted_label_encoded)
                predicted_probability = float(np.max(prediction))  # Convert to Python float

                prediction_data = {
                    'segment_number': i + 1,
                    'predicted_label': predicted_label[0],
                    'predicted_probability': predicted_probability
                }

                combined_predictions.append(prediction_data)

            # Store the combined predictions and total audio duration in a single document in the MongoDB collection
            mongo.db.voicelogin.insert_one({'predictions': combined_predictions, 'total_duration_seconds': total_duration_seconds})

            # Return the list of speaker predictions for each segment along with the total duration
            return jsonify({'predictions': combined_predictions, 'total_duration_seconds': total_duration_seconds})

    except Exception as e:
        error_message = str(e)
        return jsonify({'error': error_message}), 500


@app.route('/get_speaker_names_count', methods=['GET'])
def get_speaker_names_count():
    try:
        # Retrieve the combined predictions document from the MongoDB collection
        prediction_document = mongo.db.voicelogin.find_one({}, sort=[('_id', -1)])

        if prediction_document:
            # Extract the predictions from the document
            combined_predictions = prediction_document.get('predictions', [])

            # Extract speaker names from predictions
            speaker_names = [prediction['predicted_label'] for prediction in combined_predictions]

            # Count the number of times each speaker appears
            speaker_counts = dict(Counter(speaker_names))

            # Find the speaker with the greatest count
            most_frequent_speaker = max(speaker_counts, key=speaker_counts.get)

            # Retrieve the total duration of the audio from the document
            total_duration_seconds = prediction_document.get('total_duration_seconds', 0)

            # Round the audio duration to the nearest second and divide it by 2
            half_audio_duration = round(total_duration_seconds / 2)

            # Check if the count of the most frequent speaker is greater than half of the audio duration
            if speaker_counts.get(most_frequent_speaker, 0) > half_audio_duration:
                most_frequent_speaker_result = most_frequent_speaker
            else:
                most_frequent_speaker_result = "None"

            # Return the speaker counts, the most frequent speaker (or "None"), and the total duration as JSON
            return jsonify({
                'speaker_counts': speaker_counts,
                'most_frequent_speaker': most_frequent_speaker_result,
                'total_duration_seconds': total_duration_seconds
            })
        else:
            return jsonify({'error': 'No predictions found'}), 404

    except Exception as e:
        error_message = str(e)
        return jsonify({'error': error_message}), 500
    
@app.route('/get_emotion_data', methods=['GET'])
def get_emotion_data():
    try:
        # Retrieve data from MongoDB
        segments_data = mongo.db.segments_collection.find_one({}, sort=[('_id', -1)])

        if segments_data:
            segment_paths = segments_data['segment_paths']
            predicted_emotions = segments_data['predicted_emotions']

            emotion_data = []
            for i, segment_path in enumerate(segment_paths):
                emotion_data.append({'time': i*2 , 'emotion': predicted_emotions[i]})

            return jsonify({'emotion_data': emotion_data}), 200
        else:
            return jsonify({'error': 'No data found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Flask server code
@app.route('/predict_emotions_and_save', methods=['POST'])
def predict_emotions_and_save():
    try:
        uploaded_file = request.files['file']
        segment_duration = int(request.form.get('segment_duration', 2))  

        if uploaded_file and allowed_file(uploaded_file.filename):
            # Save the uploaded file to a temporary location
            audio_path = 'temp_audio.wav'
            uploaded_file.save(audio_path)
            print("Loaded audio duration:", librosa.get_duration(filename=audio_path))

            audio = AudioSegment.from_wav(audio_path)

            # Calculate the number of segments needed to cover the entire audio duration
            segment_count = math.ceil(len(audio) / (segment_duration * 1000))

            segment_paths = []
            predicted_emotions = []
            segment_times = []

            for i in range(segment_count):
                start_time = i * segment_duration * 1000
                end_time = min((i + 1) * segment_duration * 1000, len(audio))  # Ensure end time doesn't exceed audio duration
                print(f"Segment {i + 1}: Start Time: {start_time}, End Time: {end_time}")
                segment = audio[start_time:end_time]

                temp_segment_path = f'temp_segment_{i}.wav'
                segment.export(temp_segment_path, format="wav")

                # Preprocess and predict emotion for the segment
                input_features = preprocess_audio_for_prediction(temp_segment_path)
                predicted_emotion_index = np.argmax(loaded_model.predict(np.expand_dims(input_features, axis=0)), axis=1)
                predicted_emotion = emotion_labels[predicted_emotion_index[0]]

                segment_paths.append(temp_segment_path)
                predicted_emotions.append(predicted_emotion)
                segment_times.append(start_time / 1000)

                # Clean up: Remove the temporary segment file
                if os.path.exists(temp_segment_path):
                    os.remove(temp_segment_path)

            # Save the results to MongoDB
            mongo.db.segments_collection.insert_one({
                'original_filename': uploaded_file.filename,
                'segment_paths': segment_paths,
                'predicted_emotions': predicted_emotions,
            })

            # Clean up: Remove the temporary audio file
            if os.path.exists(audio_path):
                os.remove(audio_path)

            return jsonify({'success': 'Emotion prediction and storage completed successfully'})

        else:
            return jsonify({'error': 'Invalid file format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
@app.route('/prediction', methods=['POST'])
def prediction():
    data = request.json
    paragraph = data.get('paragraph')
    
    # Split the paragraph into sentences
    sentences = sent_tokenize(paragraph)
    
    sarcasm_results = []

    for sentence in sentences:
        # Tokenize and pad the input sentence
        text_sequence = tokeni.texts_to_sequences([sentence])
        padded_sequence = pad_sequences(text_sequence, maxlen=max_tokes)

        # Make prediction using the model
        prediction = model1.predict(padded_sequence)

        sarcasm_probability = float(prediction[0][0])  # Convert to regular float

        sentence_result = {
            'sentence': sentence,
            'prediction': "Sarcastic" if sarcasm_probability > 0.5 else "Not Sarcastic",
            'sarcasm_probability': sarcasm_probability
        }

        sarcasm_results.append(sentence_result)
    
    # Insert sarcasm results into MongoDB as a single document
    mongo.db.sarcasm.insert_one({'paragraph': paragraph, 'results': sarcasm_results})

    return jsonify(sarcasm_results)

@app.route('/get-sarcasm-results', methods=['GET'])
def get_sarcasm_results():
    try:
        # Retrieve the latest sarcasm analysis result from the database
        analysis_result = mongo.db.sarcasm.find_one({}, sort=[('_id', -1)])
        if analysis_result:
            results = analysis_result.get("results", [])
            return jsonify({"results": results})
        else:
            return jsonify({"message": "No sarcasm analysis result available"}), 404
    except Exception as e:
        app.logger.error('Error getting sarcasm analysis result: %s', str(e))
        return jsonify({"message": "Error getting sarcasm analysis result", "error": str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload():
    try:
        data = request.json
        audio_url = data.get('audioUrl')

        if audio_url:
            # Save the audio URL to MongoDB
            mongo.db.audio_collection.insert_one({'audioUrl': audio_url})
            return jsonify({'message': 'Audio sent to database successfully'}), 200
        else:
            return jsonify({'error': 'Invalid audio URL'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/upload-audio", methods=["POST"])
def upload_audio():
    try:
        app.logger.debug('Received an audio upload request')

        uploaded_file = request.files['audioFile']
        if uploaded_file:
            uploaded_file.save("uploaded_audio.wav")
            print("Uploaded audio file saved as 'uploaded_audio.wav'")

            path = "uploaded_audio.wav"
            print("Processing audio with path:", path)

            num_speakers = 2
            model_size = 'small'

            if path[-3:] != 'wav':
                print("Before FFmpeg conversion...")
                subprocess.call(['ffmpeg', '-i', path, 'audio.wav', '-y'])
                print("After FFmpeg conversion...")
                path = 'audio.wav'
                print("Path after FFmpeg conversion:", path)

            if not os.path.exists(path):
                print("Error: File not found at path:", path)
                return jsonify({"message": "Error: File not found"}), 500

            script_directory = os.path.dirname(os.path.abspath(__file__))
            path = os.path.join(script_directory, "uploaded_audio.wav")
            print("Absolute path:", path)

            uploaded_file_info = {
                "filename": uploaded_file.filename,
                "content_type": uploaded_file.content_type
            }
            print("Uploaded file info:", uploaded_file_info)
            print("Current working directory:", os.getcwd())

            model = whisper.load_model(model_size)
            result = model.transcribe(path)
            segments = result["segments"]
            with contextlib.closing(wave.open(path, 'r')) as f:
                frames = f.getnframes()
                rate = f.getframerate()
                duration = frames / float(rate)

            audio = Audio()

            embedding_model = PretrainedSpeakerEmbedding("speechbrain/spkrec-ecapa-voxceleb", device=torch.device("cpu"))

            def segment_embedding(segment):
                start = segment["start"]
                end = min(duration, segment["end"])
                clip = Segment(start, end)
                waveform, sample_rate = audio.crop(path, clip)
                waveform = waveform.mean(dim=0, keepdim=True)
                return embedding_model(waveform.unsqueeze(0))

            embeddings = np.zeros(shape=(len(segments), 192))
            for i, segment in enumerate(segments):
                embeddings[i] = segment_embedding(segment)

            embeddings = np.nan_to_num(embeddings)
            clustering = AgglomerativeClustering(num_speakers).fit(embeddings)
            labels = clustering.labels_

            for i in range(len(segments)):
                segments[i]["speaker"] = 'SPEAKER ' + str(labels[i] + 1)

            transcript = []

            for (i, segment) in enumerate(segments):
                if i == 0 or segments[i - 1]["speaker"] != segment["speaker"]:
                    formatted_time = datetime.fromtimestamp(segment["start"]).strftime('%Y-%m-%d %H:%M:%S')
                    transcript.append({"speaker": segment["speaker"], "time": formatted_time, "text": ""})
                transcript[-1]["text"] += segment["text"][1:] + ' '

            mongo.db.speech_transcripts.insert_one({"path": path, "transcript": transcript})

            # Return a success message
            return jsonify({"message": "Audio transcription uploaded to the database."})
        else:
            app.logger.warning('No audio file uploaded')
            return jsonify({"message": "No audio file uploaded"}), 400
    except Exception as e:
        app.logger.error('Error uploading audio: %s', str(e))
        return jsonify({"message": "Error uploading audio", "error": str(e)}), 500
    
@app.route("/get-transcript", methods=["GET"])
def get_transcript():
    try:
        transcript_entry = mongo.db.speech_transcripts.find_one({}, sort=[('_id', -1)])
        if transcript_entry:
            transcript = transcript_entry.get("transcript", [])
            return jsonify({"transcript": transcript})
        else:
            return jsonify({"message": "No transcript available"}), 404
    except Exception as e:
        app.logger.error('Error getting transcript: %s', str(e))
        return jsonify({"message": "Error getting transcript", "error": str(e)}), 500

@app.route("/store-speaker-transcript/<speaker_name>", methods=["POST"])
def store_speaker_transcript(speaker_name):
    try:
        transcript_data = request.json
        
        # Create a document for the speaker transcript data
        speaker_transcript = {
            "speaker": speaker_name,
            "transcript": transcript_data
        }
        
        # Store the speaker transcript data in the database
        mongo.db.speaker_transcripts.insert_one(speaker_transcript)

        return jsonify({"message": f"Transcript data for {speaker_name} stored successfully."})
    except Exception as e:
        app.logger.error(f"Error storing transcript data for {speaker_name}: {str(e)}")
        return jsonify({"message": f"Error storing transcript data for {speaker_name}"}), 500
    
@app.route('/analyze_text', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()

        # Check if 'speakerData' is present and is a string
        if 'speakerData' not in data or not isinstance(data['speakerData'], str):
            raise ValueError("Input data must contain 'speakerData' as a string")
        
        text = data['speakerData']

        app.logger.debug('Received text for analysis: %s', text)

        sentences = sent_tokenize(text)
        emotions_per_sentence = loaded_pipeline.predict(sentences)

        results = [{'sentence': sentence, 'emotion': emotion} for sentence, emotion in zip(sentences, emotions_per_sentence)]

        # Create a document to store the analysis results
        analysis_result = {
            "text": text,
            "results": results,
        }

        # Save the analysis result in the database collection
        mongo.db.text_analysis_results.insert_one(analysis_result)

        response = {
            'results': results,
        }

        return jsonify(response), 200  # 200 is the HTTP status code for OK

    except Exception as e:
        app.logger.error('Error analyzing text: %s', str(e))
        return jsonify({"message": "Error analyzing text", "error": str(e)}), 500  # 500 is the HTTP status code for Internal Server Error

@app.route("/get-emotion", methods=["GET"])
def get_emotion():
    try:
        # Retrieve the latest analysis result from the database
        analysis_result = mongo.db.text_analysis_results.find_one({}, sort=[('_id', -1)])
        if analysis_result:
            results = analysis_result.get("results", [])
            return jsonify({"results": results})
        else:
            return jsonify({"message": "No analysis result available"}), 404
    except Exception as e:
        app.logger.error('Error getting analysis result: %s', str(e))
        return jsonify({"message": "Error getting analysis result", "error": str(e)}), 500
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        paragraph = data['data']

        # Split the paragraph into sentences
        sentences = sent_tokenize(paragraph)
        
        results = []

        for sentence in sentences:
            sequence = tokenizer.texts_to_sequences([sentence])
            padded_sequence = pad_sequences(sequence, maxlen=max_len)
            prediction = model.predict(padded_sequence)

            hate_speech_probability = prediction[0][0]  # Probability of hate speech

            if hate_speech_probability < 0.5:
                label = 0
            else:
                label = 1

            result = {
                "sentence": sentence,
                "hate_speech_probability": float(hate_speech_probability),
                "label": label,
            }

            results.append(result)

        # Store all the results in a single MongoDB document
        mongo.db.hatespeech.insert_one({"predictions": results})

        return jsonify({"message": "Predictions stored in MongoDB"})

    except Exception as e:
        return jsonify({"message": "Error analyzing text", "error": str(e)}), 500
    
@app.route('/get-predictions', methods=['GET'])
def get_predictions():
    try:
        # Retrieve the latest analysis result from the database
        analysis_result = mongo.db.hatespeech.find_one({}, sort=[('_id', -1)])
        if analysis_result:
            predictions = analysis_result.get("predictions", [])  # Changed from "results" to "predictions"
            return jsonify({"predictions": predictions})  # Changed from "results" to "predictions"
        else:
            return jsonify({"message": "No analysis result available"}), 404
    except Exception as e:
        app.logger.error('Error getting analysis result: %s', str(e))
        return jsonify({"message": "Error getting analysis result", "error": str(e)}), 500

if __name__ == "__main__":
    if not os.path.exists('uploadsaudio'):
        os.mkdir('uploadsaudio')
    if not os.path.exists('segmentation'):
        os.mkdir('segmentation')

    # Run the Flask app without the reloader
    app.run(debug=True, port=5001, use_reloader=False)

