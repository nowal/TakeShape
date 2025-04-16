#!/usr/bin/env python3
# Flask application for MASt3R 3D reconstruction web app with direct processing

import os
import uuid
import json
import tempfile
import threading
from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import torch
from werkzeug.utils import secure_filename

# Import MASt3R modules
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Check for required dependencies
try:
    import einops
    import roma
    import matplotlib
    import gradio
    import torchvision
    import cv2
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Please install all required dependencies with: pip install -r requirements.txt")
    print("Or run: pip install einops roma matplotlib gradio torchvision opencv-python")
    sys.exit(1)

try:
    from mast3r.model import AsymmetricMASt3R
    from mast3r.cloud_opt.sparse_ga import sparse_global_alignment
    from dust3r.image_pairs import make_pairs
    from dust3r.utils.image import load_images
    from dust3r.utils.device import to_numpy
except ImportError as e:
    print(f"Error importing MASt3R modules: {e}")
    print("Please make sure MASt3R is properly installed and accessible.")
    sys.exit(1)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.urandom(24)
# Enable CORS for all routes, but specifically allow the Next.js domain
# Replace 'https://your-nextjs-domain.com' with your actual Next.js app URL when deployed
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "https://localhost:3000", "https://www.takeshapehome.com", "https://takeshapehome.com"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "X-Client-Info"],
    "supports_credentials": False  # Set to True only if you need to send cookies
}})

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure cache folder for MASt3R
CACHE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cache')
os.makedirs(CACHE_FOLDER, exist_ok=True)

# Configure model
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                         "checkpoints/MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric.pth"))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
IMAGE_SIZE = (512, 512)  # Use tuple instead of integer
PATCH_SIZE = 16  # Default patch size for MASt3R

# Initialize model
model = None
model_loading_thread = None

def load_model():
    global model
    if model is None:
        print("Loading MASt3R model...")
        
        # Check if the model file exists
        if not os.path.isfile(MODEL_PATH):
            raise FileNotFoundError(f"Model checkpoint not found at: {MODEL_PATH}")
        
        try:
            # Use the direct loading method from mast3r.model but with weights_only=False
            # First, add argparse.Namespace to safe globals
            import argparse
            import torch.serialization
            import math
            torch.serialization.add_safe_globals([argparse.Namespace])
            
            # Define inf in the global scope for eval
            inf = float('inf')
            
            # Then load the model with weights_only=False
            ckpt = torch.load(MODEL_PATH, map_location='cpu', weights_only=False)
            args = ckpt['args'].model.replace("ManyAR_PatchEmbed", "PatchEmbedDust3R")
            if 'landscape_only' not in args:
                args = args[:-1] + ', landscape_only=False)'
            else:
                args = args.replace(" ", "").replace('landscape_only=True', 'landscape_only=False')
            print(f"Instantiating model with args: {args}")
            model = eval(args)
            model.load_state_dict(ckpt['model'], strict=False)
            model = model.to(DEVICE)
            print("Model loaded successfully")
        except Exception as e:
            print(f"Error loading model with direct method: {str(e)}")
            print("Trying alternative loading method...")
            
            # Try alternative loading method with explicit parameters and correct head type/output mode
            try:
                # Use the exact parameters from the checkpoint
                model = AsymmetricMASt3R(
                    output_mode='pts3d+desc24',  # Match checkpoint
                    head_type='catmlp+dpt',      # Match checkpoint
                    depth_mode=('exp', float('-inf'), float('inf')),
                    conf_mode=('exp', 1, float('inf')),
                    landscape_only=False,
                    patch_size=PATCH_SIZE,
                    img_size=IMAGE_SIZE,
                    # Match the architecture parameters from the checkpoint
                    enc_embed_dim=1024,  # Match checkpoint (ViT-Large)
                    dec_embed_dim=768,   # Match checkpoint
                    enc_depth=24,        # Match checkpoint
                    dec_depth=12,        # Match checkpoint
                    enc_num_heads=16,    # Match checkpoint
                    dec_num_heads=12,    # Match checkpoint
                    pos_embed='RoPE100', # Match checkpoint
                    two_confs=True,      # Match checkpoint
                    desc_conf_mode=('exp', 0, float('inf'))  # Match checkpoint
                )
                
                # Load state dict from checkpoint with weights_only=False
                import argparse
                import torch.serialization
                torch.serialization.add_safe_globals([argparse.Namespace])
                checkpoint = torch.load(MODEL_PATH, map_location='cpu', weights_only=False)
                model.load_state_dict(checkpoint['model'], strict=False)
                model = model.to(DEVICE)
                print("Model loaded successfully with alternative method")
            except Exception as e2:
                raise Exception(f"Failed to load model: {str(e2)}")

# Initialize model loading in a background thread
def initialize_model_loading():
    global model_loading_thread
    model_loading_thread = threading.Thread(target=load_model)
    model_loading_thread.daemon = True  # Make thread exit when main thread exits
    model_loading_thread.start()

# Start loading the model in the background when the app starts
initialize_model_loading()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/direct-process', methods=['POST'])
def direct_process_images():
    """
    New endpoint that directly processes images without storing session/room data.
    This endpoint takes images, processes them, and returns the 3D model URL.
    """
    print("\n----- DIRECT PROCESS REQUEST RECEIVED -----")
    
    # Check if there are any images in the request
    if 'images' not in request.files:
        print("ERROR: No images found in request")
        return jsonify({'error': 'No images provided'}), 400
    
    # Get all images from the request
    image_files = request.files.getlist('images')
    
    if not image_files or len(image_files) < 2:
        print(f"ERROR: Not enough images provided, found {len(image_files) if image_files else 0}")
        return jsonify({'error': 'Need at least 2 images'}), 400
    
    print(f"Found {len(image_files)} images in request")
    
    # Create a temporary directory for this processing job
    temp_id = str(uuid.uuid4())
    temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], temp_id)
    os.makedirs(temp_dir, exist_ok=True)
    
    # Save all images to the temporary directory
    image_paths = []
    for i, file in enumerate(image_files):
        if file.filename == '':
            continue
            
        filename = secure_filename(file.filename)
        image_path = os.path.join(temp_dir, filename)
        print(f"Saving image {i+1}/{len(image_files)} to: {image_path}")
        file.save(image_path)
        image_paths.append(image_path)
    
    if len(image_paths) < 2:
        print("ERROR: Not enough valid images to process")
        return jsonify({'error': 'Need at least 2 valid images'}), 400
    
    # Make sure the model is loaded
    if model is None:
        # If the model is still loading, wait for it to complete
        if model_loading_thread and model_loading_thread.is_alive():
            print("Waiting for model to finish loading...")
            model_loading_thread.join()
        else:
            # If for some reason the model wasn't loaded, load it now
            print("Model not loaded, loading now...")
            load_model()
    
    try:
        # Process the images
        print(f"Processing {len(image_paths)} images")
        
        # Create a temporary directory for processing
        with tempfile.TemporaryDirectory() as tmp_dir:
            # Load images
            print("Loading images...")
            imgs = load_images(image_paths, size=IMAGE_SIZE[0], verbose=True)  # Use first element of the tuple
            
            # Create image pairs
            print("Creating image pairs...")
            pairs = make_pairs(imgs, scene_graph="complete", prefilter=None, symmetrize=True)
            
            # Run sparse global alignment with reduced optimization steps
            print("Running sparse global alignment...")
            scene = sparse_global_alignment(
                image_paths, 
                pairs, 
                CACHE_FOLDER,
                model, 
                lr1=0.07, 
                niter1=100,  # Reduced from 500 to 100
                lr2=0.014, 
                niter2=0,    # Removed second optimization phase
                device=DEVICE,
                opt_depth=True,
                matching_conf_thr=0
            )
            
            # Generate 3D model
            print("Generating 3D model...")
            output_path = os.path.join(temp_dir, 'model.glb')
            
            # Get 3D points and save as GLB
            pts3d, _, confs = scene.get_dense_pts3d(clean_depth=True)
            
            # Create a SparseGAState object
            from mast3r.demo import SparseGAState
            scene_state = SparseGAState(scene, should_delete=False, cache_dir=CACHE_FOLDER, outfile_name=output_path)
            
            # Save the model
            from mast3r.demo import get_3D_model_from_scene
            model_path = get_3D_model_from_scene(
                silent=True,
                scene_state=scene_state,  # Pass the state object, not the raw scene
                min_conf_thr=1.5,
                as_pointcloud=True,
                mask_sky=False,
                clean_depth=True,
                transparent_cams=False,
                cam_size=0.2,
                TSDF_thresh=0
            )
            
            # Use the actual model path if available, otherwise use the default path
            if model_path and os.path.exists(model_path):
                final_model_path = model_path
                print(f"Model saved to: {final_model_path}")
            else:
                final_model_path = output_path
                print(f"Warning: Model path not returned or file doesn't exist. Using default path: {final_model_path}")
            
            # Convert to a URL path for the frontend
            if final_model_path.startswith(app.config['UPLOAD_FOLDER']):
                # Convert absolute path to relative URL path
                rel_path = os.path.relpath(final_model_path, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static'))
                model_url = f"/static/{rel_path}"
            else:
                model_url = final_model_path
            
            print(f"Processing complete, model URL: {model_url}")
            print("----- DIRECT PROCESS REQUEST COMPLETED -----\n")
            
            return jsonify({
                'success': True,
                'modelPath': model_url,
                'tempId': temp_id,
                'imageCount': len(image_paths)
            })
    
    except Exception as e:
        print(f"Error processing images: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Keep the existing endpoints for backward compatibility
@app.route('/api/upload', methods=['POST'])
def upload_image():
    print("\n----- UPLOAD REQUEST RECEIVED -----")
    print(f"Request method: {request.method}")
    print(f"Request headers: {dict(request.headers)}")
    print(f"Request form data keys: {list(request.form.keys())}")
    print(f"Request files keys: {list(request.files.keys())}")
    
    if 'image' not in request.files:
        print("ERROR: No image part found in request.files")
        print(f"Request body preview: {request.get_data()[:1000]}...")  # Print first 1000 bytes
        return jsonify({'error': 'No image part'}), 400
    
    file = request.files['image']
    print(f"Image file info: {file.filename}, {file.content_type}, {file.content_length} bytes")
    
    if file.filename == '':
        print("ERROR: Empty filename")
        return jsonify({'error': 'No selected file'}), 400
    
    # Get session ID from request
    session_id = request.form.get('sessionId')
    print(f"Session ID from form: {session_id}")
    
    if not session_id:
        print("ERROR: No session ID provided")
        return jsonify({'error': 'Session ID is required'}), 400
    
    # Create a new room ID
    room_id = str(uuid.uuid4())
    print(f"Created new room with ID: {room_id}")
    
    # Create room directory if it doesn't exist
    room_dir = os.path.join(app.config['UPLOAD_FOLDER'], room_id)
    os.makedirs(room_dir, exist_ok=True)
    
    # Save the image
    filename = secure_filename(file.filename)
    image_path = os.path.join(room_dir, filename)
    print(f"Saving image to: {image_path}")
    file.save(image_path)
    
    response_data = {
        'roomId': room_id,
        'imageCount': 1,
        'imagePath': image_path,
        'sessionId': session_id
    }
    print(f"Returning response: {response_data}")
    print("----- UPLOAD REQUEST COMPLETED -----\n")
    
    return jsonify(response_data)

@app.route('/api/batch-upload', methods=['POST'])
def batch_upload_images():
    print("\n----- BATCH UPLOAD REQUEST RECEIVED -----")
    print(f"Request method: {request.method}")
    print(f"Request headers: {dict(request.headers)}")
    print(f"Request form data keys: {list(request.form.keys())}")
    print(f"Request files keys: {list(request.files.keys())}")
    
    # Get session ID from request
    session_id = request.form.get('sessionId')
    print(f"Session ID from form: {session_id}")
    
    if not session_id:
        print("ERROR: No session ID provided")
        return jsonify({'error': 'Session ID is required'}), 400
    
    # Check if there are any images in the request
    image_files = []
    for key in request.files:
        if key.startswith('image'):
            image_files.append(request.files[key])
    
    if not image_files:
        print("ERROR: No images found in request")
        return jsonify({'error': 'No images provided'}), 400
    
    print(f"Found {len(image_files)} images in request")
    
    # Create a new room
    room_id = str(uuid.uuid4())
    print(f"Created new room with ID: {room_id}")
    
    # Create room directory if it doesn't exist
    room_dir = os.path.join(app.config['UPLOAD_FOLDER'], room_id)
    os.makedirs(room_dir, exist_ok=True)
    
    # Save all images
    image_paths = []
    for i, file in enumerate(image_files):
        if file.filename == '':
            continue
            
        filename = secure_filename(file.filename)
        image_path = os.path.join(room_dir, filename)
        print(f"Saving image {i+1}/{len(image_files)} to: {image_path}")
        file.save(image_path)
        image_paths.append(image_path)
    
    if not image_paths:
        print("ERROR: No valid images to save")
        return jsonify({'error': 'No valid images to save'}), 400
    
    response_data = {
        'roomId': room_id,
        'imageCount': len(image_paths),
        'imagePaths': image_paths,
        'sessionId': session_id
    }
    print(f"Returning response: {response_data}")
    print("----- BATCH UPLOAD REQUEST COMPLETED -----\n")
    
    return jsonify(response_data)

@app.route('/api/process', methods=['POST'])
def process_images():
    print("\n----- PROCESS REQUEST RECEIVED -----")
    data = request.json
    room_id = data.get('roomId')
    session_id = data.get('sessionId')
    
    print(f"Processing request for room {room_id}, session {session_id}")
    
    if not session_id:
        print("ERROR: No session ID provided")
        return jsonify({'error': 'Session ID is required'}), 400
    
    if not room_id:
        print("ERROR: No room ID provided")
        return jsonify({'error': 'Room ID is required'}), 400
    
    # Check if the room directory exists
    room_dir = os.path.join(app.config['UPLOAD_FOLDER'], room_id)
    if not os.path.exists(room_dir):
        print(f"ERROR: Room directory not found: {room_dir}")
        return jsonify({'error': 'Room not found'}), 404
    
    # Get all image files in the room directory
    image_paths = []
    for filename in os.listdir(room_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            image_paths.append(os.path.join(room_dir, filename))
    
    if len(image_paths) < 2:
        print(f"ERROR: Not enough images in room {room_id}, found {len(image_paths)}")
        return jsonify({'error': 'Need at least 2 images'}), 400
    
    print(f"Found {len(image_paths)} images in room {room_id}")
    
    # Make sure the model is loaded
    if model is None:
        # If the model is still loading, wait for it to complete
        if model_loading_thread and model_loading_thread.is_alive():
            print("Waiting for model to finish loading...")
            model_loading_thread.join()
        else:
            # If for some reason the model wasn't loaded, load it now
            print("Model not loaded, loading now...")
            load_model()
    
    try:
        # Process all images in the room
        print(f"Processing {len(image_paths)} images")
        
        # Create a temporary directory for processing
        with tempfile.TemporaryDirectory() as tmp_dir:
            # Load images
            print("Loading images...")
            imgs = load_images(image_paths, size=IMAGE_SIZE[0], verbose=True)  # Use first element of the tuple
            
            # Create image pairs
            print("Creating image pairs...")
            pairs = make_pairs(imgs, scene_graph="complete", prefilter=None, symmetrize=True)
            
            # Run sparse global alignment with reduced optimization steps
            print("Running sparse global alignment...")
            scene = sparse_global_alignment(
                image_paths, 
                pairs, 
                CACHE_FOLDER,
                model, 
                lr1=0.07, 
                niter1=100,  # Reduced from 500 to 100
                lr2=0.014, 
                niter2=0,    # Removed second optimization phase
                device=DEVICE,
                opt_depth=True,
                matching_conf_thr=0
            )
            
            # Generate 3D model
            print("Generating 3D model...")
            output_path = os.path.join(room_dir, 'model.glb')
            
            # Get 3D points and save as GLB
            pts3d, _, confs = scene.get_dense_pts3d(clean_depth=True)
            
            # Create a SparseGAState object
            from mast3r.demo import SparseGAState
            scene_state = SparseGAState(scene, should_delete=False, cache_dir=CACHE_FOLDER, outfile_name=output_path)
            
            # Save the model
            from mast3r.demo import get_3D_model_from_scene
            model_path = get_3D_model_from_scene(
                silent=True,
                scene_state=scene_state,  # Pass the state object, not the raw scene
                min_conf_thr=1.5,
                as_pointcloud=True,
                mask_sky=False,
                clean_depth=True,
                transparent_cams=False,
                cam_size=0.2,
                TSDF_thresh=0
            )
            
            # Use the actual model path if available, otherwise use the default path
            if model_path and os.path.exists(model_path):
                final_model_path = model_path
                print(f"Model saved to: {final_model_path}")
            else:
                final_model_path = output_path
                print(f"Warning: Model path not returned or file doesn't exist. Using default path: {final_model_path}")
            
            # Convert to a URL path for the frontend
            if final_model_path.startswith(app.config['UPLOAD_FOLDER']):
                # Convert absolute path to relative URL path
                rel_path = os.path.relpath(final_model_path, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static'))
                model_url = f"/static/{rel_path}"
            else:
                model_url = final_model_path
            
            print(f"Processing complete, model URL: {model_url}")
            print("----- PROCESS REQUEST COMPLETED -----\n")
            
            return jsonify({
                'success': True,
                'roomId': room_id,
                'modelPath': model_url,
                'sessionId': session_id
            })
    
    except Exception as e:
        print(f"Error processing images: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Use port 443 for HTTPS
    app.run(host='0.0.0.0', port=443, debug=True, ssl_context='adhoc')
