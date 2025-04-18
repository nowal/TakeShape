#!/usr/bin/env python3
# Flask application for MASt3R 3D reconstruction web app with direct processing

import os
import uuid
import json
import tempfile
import threading
import time
from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import torch
from werkzeug.utils import secure_filename

# Import MASt3R modules
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.urandom(24)
# Enable CORS for all routes
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "https://localhost:3000", "https://www.takeshapehome.com", "https://takeshapehome.com"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "X-Client-Info"],
    "supports_credentials": False
}})

# Add an after_request handler to ensure all responses have CORS headers
@app.after_request
def add_cors_headers(response):
    # Ensure all responses have CORS headers, even large ones
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    
    # Add headers to improve response handling
    response.headers.add('Cache-Control', 'no-cache')
    response.headers.add('Connection', 'keep-alive')
    response.headers.add('Keep-Alive', 'timeout=300')  # 5 minutes
    
    return response

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
IMAGE_SIZE = (512, 512)
PATCH_SIZE = 16

# Initialize model
model = None
model_loading_thread = None

# Dictionary to store job status
job_status = {}

def load_model():
    global model
    if model is None:
        print("Loading MASt3R model...")
        
        # Check if the model file exists
        if not os.path.isfile(MODEL_PATH):
            raise FileNotFoundError(f"Model checkpoint not found at: {MODEL_PATH}")
        
        try:
            # Use the direct loading method from mast3r.model but with weights_only=False
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
            
            # Try alternative loading method with explicit parameters
            try:
                from mast3r.model import AsymmetricMASt3R
                # Use the exact parameters from the checkpoint
                model = AsymmetricMASt3R(
                    output_mode='pts3d+desc24',
                    head_type='catmlp+dpt',
                    depth_mode=('exp', float('-inf'), float('inf')),
                    conf_mode=('exp', 1, float('inf')),
                    landscape_only=False,
                    patch_size=PATCH_SIZE,
                    img_size=IMAGE_SIZE,
                    enc_embed_dim=1024,
                    dec_embed_dim=768,
                    enc_depth=24,
                    dec_depth=12,
                    enc_num_heads=16,
                    dec_num_heads=12,
                    pos_embed='RoPE100',
                    two_confs=True,
                    desc_conf_mode=('exp', 0, float('inf'))
                )
                
                # Load state dict from checkpoint with weights_only=False
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
    model_loading_thread.daemon = True
    model_loading_thread.start()

# Start loading the model in the background when the app starts
initialize_model_loading()

# Function to process images in a background thread
def process_images_background(job_id, image_paths, temp_dir):
    global job_status
    
    try:
        # Make sure the model is loaded
        if model is None:
            # If the model is still loading, wait for it to complete
            if model_loading_thread and model_loading_thread.is_alive():
                print(f"Job {job_id}: Waiting for model to finish loading...")
                job_status[job_id]['status'] = 'waiting_for_model'
                model_loading_thread.join()
            else:
                # If for some reason the model wasn't loaded, load it now
                print(f"Job {job_id}: Model not loaded, loading now...")
                job_status[job_id]['status'] = 'loading_model'
                load_model()
        
        # Update job status
        job_status[job_id]['status'] = 'processing'
        job_status[job_id]['progress'] = 10
        
        # Create a temporary directory for processing
        with tempfile.TemporaryDirectory() as tmp_dir:
            # Load images
            print(f"Job {job_id}: Loading images...")
            from dust3r.utils.image import load_images
            job_status[job_id]['progress'] = 20
            imgs = load_images(image_paths, size=IMAGE_SIZE[0], verbose=True)
            
            # Create image pairs
            print(f"Job {job_id}: Creating image pairs...")
            from dust3r.image_pairs import make_pairs
            job_status[job_id]['progress'] = 30
            pairs = make_pairs(imgs, scene_graph="complete", prefilter=None, symmetrize=True)
            
            # Run sparse global alignment with reduced optimization steps
            print(f"Job {job_id}: Running sparse global alignment...")
            from mast3r.cloud_opt.sparse_ga import sparse_global_alignment
            job_status[job_id]['progress'] = 40
            scene = sparse_global_alignment(
                image_paths, 
                pairs, 
                CACHE_FOLDER,
                model, 
                lr1=0.07, 
                niter1=100,
                lr2=0.014, 
                niter2=0,
                device=DEVICE,
                opt_depth=True,
                matching_conf_thr=0
            )
            
            # Generate 3D model
            print(f"Job {job_id}: Generating 3D model...")
            job_status[job_id]['progress'] = 70
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
                scene_state=scene_state,
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
                print(f"Job {job_id}: Model saved to: {final_model_path}")
            else:
                final_model_path = output_path
                print(f"Job {job_id}: Warning: Model path not returned or file doesn't exist. Using default path: {final_model_path}")
            
            # Convert to a URL path for the frontend
            if final_model_path.startswith(app.config['UPLOAD_FOLDER']):
                # Convert absolute path to relative URL path
                rel_path = os.path.relpath(final_model_path, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static'))
                model_url = f"/static/{rel_path}"
            else:
                model_url = final_model_path
            
            # Update job status with the model URL
            job_status[job_id]['status'] = 'complete'
            job_status[job_id]['progress'] = 100
            job_status[job_id]['model_path'] = model_url
            job_status[job_id]['completion_time'] = time.time()
            
            print(f"Job {job_id}: Processing complete, model URL: {model_url}")
    
    except Exception as e:
        print(f"Job {job_id}: Error processing images: {str(e)}")
        job_status[job_id]['status'] = 'error'
        job_status[job_id]['error'] = str(e)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/start-processing', methods=['POST'])
def start_processing():
    """
    Start processing images in a background thread and return immediately with a job ID.
    """
    print("\n----- START PROCESSING REQUEST RECEIVED -----")
    
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
    
    # Create a job ID
    job_id = str(uuid.uuid4())
    
    # Create a temporary directory for this processing job
    temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], job_id)
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
    
    # Initialize job status
    job_status[job_id] = {
        'status': 'initializing',
        'progress': 0,
        'image_count': len(image_paths),
        'start_time': time.time()
    }
    
    # Start processing in a background thread
    thread = threading.Thread(target=process_images_background, args=(job_id, image_paths, temp_dir))
    thread.daemon = True
    thread.start()
    
    print(f"Started processing job {job_id} in background thread")
    print("----- START PROCESSING REQUEST COMPLETED -----\n")
    
    # Return immediately with the job ID
    return jsonify({
        'job_id': job_id,
        'status': 'processing',
        'image_count': len(image_paths)
    })

@app.route('/api/job-status/<job_id>', methods=['GET'])
def check_job_status(job_id):
    """
    Check the status of a processing job.
    """
    print(f"\n----- JOB STATUS REQUEST RECEIVED FOR {job_id} -----")
    
    if job_id not in job_status:
        print(f"ERROR: Job {job_id} not found")
        return jsonify({'error': 'Job not found'}), 404
    
    status = job_status[job_id]
    print(f"Job {job_id} status: {status}")
    print("----- JOB STATUS REQUEST COMPLETED -----\n")
    
    return jsonify(status)

if __name__ == '__main__':
    # Use port 443 for HTTPS
    app.run(host='0.0.0.0', port=443, debug=True, ssl_context='adhoc')
