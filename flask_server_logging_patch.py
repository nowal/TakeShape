"""
Flask Server Logging Patch

This script contains enhanced logging for the Flask server's upload endpoint.
Copy the modified upload_image function to your flask_server_update.py file.
"""

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
    
    # Get current room ID or create a new one
    room_id = request.form.get('roomId')
    print(f"Room ID from form: {room_id}")
    
    # Get or create session data
    session_info = get_or_create_session(session_id)
    rooms = session_info.get('rooms', {})
    
    # If room_id is provided but the room is already processed, ignore it and create a new room
    if room_id and room_id in rooms and rooms[room_id].get('processed', False):
        print(f"Room {room_id} already processed, creating new room")
        room_id = None
        
    # Create a new room if needed
    if not room_id:
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
    
    # Update session data
    if room_id not in rooms:
        rooms[room_id] = {
            'name': f'Room {len(rooms) + 1}',
            'images': [],
            'created_at': len(rooms),  # Store creation order for sorting
            'processed': False  # Track if this room has been processed
        }
        print(f"Created new room entry in session data: {rooms[room_id]}")
    
    rooms[room_id]['images'].append(image_path)
    session_info['rooms'] = rooms
    
    response_data = {
        'roomId': room_id,
        'imageCount': len(rooms[room_id]['images']),
        'imagePath': image_path,
        'sessionId': session_id
    }
    print(f"Returning response: {response_data}")
    print("----- UPLOAD REQUEST COMPLETED -----\n")
    
    return jsonify(response_data)
