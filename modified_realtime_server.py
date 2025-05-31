import os
import time
import uuid
import threading
import cv2
import numpy as np
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import torch

# Import our real-time multi-section SLAM implementation
from realtime_multi_section_slam import RealtimeMultiSectionSLAM

# Initialize Flask app
app = Flask(__name__, static_folder='.')
app.secret_key = os.urandom(24)
# Enable CORS for all routes, but specifically allow the Next.js domain
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "https://localhost:3000", "https://www.takeshapehome.com", "https://takeshapehome.com"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "X-Client-Info"],
    "supports_credentials": False  # Set to True only if you need to send cookies
}})

app.config['UPLOAD_FOLDER'] = 'temp_videos'
app.config['FRAMES_FOLDER'] = 'temp_frames'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max upload size

@app.after_request
def add_cors_headers(response):
    # Ensure all responses have CORS headers, even large ones
    response.headers.add('Access-Control-Allow-Origin', '*')  # Or use specific domains
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    
    # Add headers to improve response handling
    response.headers.add('Cache-Control', 'no-cache')
    response.headers.add('Connection', 'keep-alive')  # Keep connection alive for large responses
    
    # Increase timeout for large responses
    response.headers.add('Keep-Alive', 'timeout=300')  # 5 minutes
    
    return response

# Create upload and frames folders if they don't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['FRAMES_FOLDER'], exist_ok=True)

# Global variables to store SLAM state
slam_state = {
    'slam_instances': {},  # Dictionary of SLAM instances by session_id
    'sessions': {},        # Session information
}

# API Routes
@app.route('/')
def index():
    """Serve the main page"""
    return send_from_directory('.', 'index.html')

@app.route('/api/start-session', methods=['POST'])
def start_session():
    """Start a new SLAM session"""
    session_id = str(uuid.uuid4())
    
    # Initialize session
    slam_state['sessions'][session_id] = {
        'frame_count': 0,
        'keyframe_count': 0,
        'reconstruction': None,
        'sections': [],
        'in_relocalization_mode': False
    }
    
    return jsonify({
        'status': 'success',
        'session_id': session_id
    })

@app.route('/api/process-frames/<session_id>', methods=['POST'])
def process_frames(session_id):
    """
    Process frames for the given session.
    This is the main endpoint that handles frame processing and returns the reconstruction.
    """
    # Validate session ID
    if session_id not in slam_state['sessions']:
        # Create a new session if it doesn't exist
        session_id = str(uuid.uuid4())
        slam_state['sessions'][session_id] = {
            'frame_count': 0,
            'keyframe_count': 0,
            'reconstruction': None,
            'sections': [],
            'in_relocalization_mode': False
        }
    
    # Get frames from request
    if 'frames' not in request.files:
        return jsonify({
            'status': 'error',
            'message': 'No frames provided'
        }), 400
    
    # Process frames
    frames = []
    for frame_file in request.files.getlist('frames'):
        # Read frame
        frame = cv2.imdecode(np.frombuffer(frame_file.read(), np.uint8), cv2.IMREAD_COLOR)
        frames.append(frame)
    
    if not frames:
        return jsonify({
            'status': 'error',
            'message': 'No valid frames provided'
        }), 400
    
    # Get or create SLAM instance
    slam_instance = get_or_create_slam_instance(session_id)
    
    # Get session info
    session = slam_state['sessions'][session_id]
    in_relocalization_mode = session.get('in_relocalization_mode', False)
    
    # Process frames
    result = slam_instance.process_frames(
        frames, 
        session_id=session_id,
        is_relocalization=in_relocalization_mode
    )
    
    # Update session information
    session['frame_count'] += result.get('frames_processed', 0)
    session['keyframe_count'] += result.get('keyframes_added', 0)
    
    # Check if relocalization is needed
    if result.get('relocalization_needed', False) and not in_relocalization_mode:
        # Set session to relocalization mode
        session['in_relocalization_mode'] = True
        
        # Get current reconstruction
        reconstruction = slam_instance.get_reconstruction(include_all_sections=True)
        
        # Return response with relocalization needed flag
        return jsonify({
            'status': 'success',
            'message': 'Relocalization needed',
            'relocalization_needed': True,
            'reconstruction': reconstruction,
            'sections': slam_instance.get_sections_info()
        })
    
    # Check if relocalization was successful
    if in_relocalization_mode and result.get('relocalization_successful', False):
        # Exit relocalization mode
        session['in_relocalization_mode'] = False
        
        # Get updated reconstruction
        reconstruction = slam_instance.get_reconstruction(include_all_sections=True)
        
        # Return response with relocalization successful flag
        return jsonify({
            'status': 'success',
            'message': 'Relocalization successful',
            'relocalization_successful': True,
            'in_relocalization_mode': False,
            'reconstruction': reconstruction,
            'sections': slam_instance.get_sections_info()
        })
    
    # If we're in relocalization mode but not yet successful, continue
    if in_relocalization_mode:
        return jsonify({
            'status': 'success',
            'message': 'Processing relocalization frames',
            'in_relocalization_mode': True
        })
    
    # Normal processing - get reconstruction and return
    reconstruction = slam_instance.get_reconstruction(include_all_sections=True)
    
    return jsonify({
        'status': 'success',
        'message': f'Processed {len(frames)} frames',
        'reconstruction': reconstruction,
        'sections': slam_instance.get_sections_info(),
        'frame_count': session['frame_count'],
        'keyframe_count': session['keyframe_count']
    })

@app.route('/api/enter-relocalization-mode/<session_id>', methods=['POST'])
def enter_relocalization_mode(session_id):
    """Notify backend that frontend is now in relocalization mode"""
    if session_id not in slam_state['sessions']:
        return jsonify({
            'status': 'error',
            'message': 'Invalid session ID'
        }), 400
    
    # Update session state
    slam_state['sessions'][session_id]['in_relocalization_mode'] = True
    
    # Reset relocalization counter in SLAM instance
    slam_instance = slam_state['slam_instances'].get(session_id)
    if slam_instance:
        slam_instance.reset_relocalization_state()
    
    print(f"[Session {session_id}] Entered relocalization mode")
    
    return jsonify({
        'status': 'success',
        'message': 'Entered relocalization mode'
    })

def get_or_create_slam_instance(session_id):
    """Get or create a SLAM instance for the given session"""
    if session_id not in slam_state['slam_instances']:
        print(f"Creating new SLAM instance for session: {session_id}")
        slam_instance = RealtimeMultiSectionSLAM()
        slam_state['slam_instances'][session_id] = slam_instance
    
    return slam_state['slam_instances'][session_id]

if __name__ == '__main__':
    # Check if SSL certificate files exist
    ssl_cert = '/etc/ssl/certs/selfsigned.crt'
    ssl_key = '/etc/ssl/private/selfsigned.key'
    
    if os.path.exists(ssl_cert) and os.path.exists(ssl_key):
        print(f"Using SSL certificate: {ssl_cert}")
        print(f"Using SSL key: {ssl_key}")
        ssl_context = (ssl_cert, ssl_key)
    else:
        print("SSL certificate files not found, using adhoc SSL")
        ssl_context = 'adhoc'
    
    # Start Flask server with HTTPS
    app.run(host='0.0.0.0', port=443, debug=True, 
            ssl_context=ssl_context)
