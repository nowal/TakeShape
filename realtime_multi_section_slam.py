import os
import time
import uuid
import numpy as np
import cv2
import json
import threading
from typing import List, Dict, Any, Optional, Tuple

class RealtimeMultiSectionSLAM:
    """
    A class for real-time multi-section SLAM (Simultaneous Localization and Mapping)
    This implementation processes frames in batches and maintains multiple sections
    for better organization of the 3D reconstruction.
    """
    
    def __init__(self):
        """Initialize the SLAM system"""
        # Core SLAM state
        self.frames = []
        self.keyframes = []
        self.keyframe_poses = {}
        self.point_cloud = None
        self.current_pose = np.eye(4)  # Identity matrix (no transformation)
        
        # Section management
        self.sections = []
        self.current_section_id = None
        self.section_lock = threading.Lock()
        
        # Processing state
        self.is_initialized = False
        self.last_frame_id = 0
        self.last_keyframe_id = 0
        self.tracking_lost = False
        
        # Create a new section to start with
        self._create_new_section()
        
        print("RealtimeMultiSectionSLAM initialized")
    
    def _create_new_section(self) -> str:
        """Create a new section and set it as the current section"""
        with self.section_lock:
            section_id = str(uuid.uuid4())
            section = {
                'id': section_id,
                'keyframes': [],
                'point_cloud': None,
                'created_at': time.time(),
                'updated_at': time.time(),
                'frames_processed': 0,
                'keyframes_added': 0
            }
            self.sections.append(section)
            self.current_section_id = section_id
            print(f"Created new section: {section_id}")
            return section_id
    
    def _get_current_section(self) -> Dict[str, Any]:
        """Get the current section"""
        with self.section_lock:
            for section in self.sections:
                if section['id'] == self.current_section_id:
                    return section
            
            # If no current section, create a new one
            self._create_new_section()
            return self._get_current_section()
    
    def _update_section(self, section_id: str, updates: Dict[str, Any]) -> None:
        """Update a section with the given updates"""
        with self.section_lock:
            for section in self.sections:
                if section['id'] == section_id:
                    section.update(updates)
                    section['updated_at'] = time.time()
                    break
    
    def process_frames(self, frames: List[np.ndarray], session_id: str) -> Dict[str, Any]:
        """
        Process a batch of frames and update the SLAM state
        
        Args:
            frames: List of frames to process (numpy arrays)
            session_id: Session ID for tracking
            
        Returns:
            dict: Processing results
        """
        if not frames:
            return {
                'status': 'error',
                'message': 'No frames provided',
                'frames_processed': 0,
                'keyframes_added': 0
            }
        
        start_time = time.time()
        frames_processed = 0
        keyframes_added = 0
        
        # Get the current section
        current_section = self._get_current_section()
        
        # Process each frame
        for frame in frames:
            # Skip invalid frames
            if frame is None or frame.size == 0:
                continue
            
            # Resize frame if needed
            if frame.shape[0] > 192 or frame.shape[1] > 256:
                frame = cv2.resize(frame, (256, 192))
            
            # Convert to grayscale for feature detection
            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Extract features (ORB features work well for SLAM)
            orb = cv2.ORB_create(nfeatures=500)
            keypoints, descriptors = orb.detectAndCompute(gray_frame, None)
            
            # Skip frames with too few features
            if descriptors is None or len(keypoints) < 10:
                continue
            
            # Generate a unique frame ID
            frame_id = f"{session_id}_{self.last_frame_id}"
            self.last_frame_id += 1
            
            # Store the frame
            frame_data = {
                'id': frame_id,
                'frame': frame,
                'keypoints': keypoints,
                'descriptors': descriptors,
                'timestamp': time.time(),
                'section_id': self.current_section_id
            }
            
            self.frames.append(frame_data)
            frames_processed += 1
            
            # Determine if this should be a keyframe
            is_keyframe = self._should_be_keyframe(frame_data)
            
            if is_keyframe:
                # Generate a unique keyframe ID
                keyframe_id = f"{session_id}_{self.last_keyframe_id}"
                self.last_keyframe_id += 1
                
                # Create keyframe
                keyframe = {
                    'id': keyframe_id,
                    'frame_id': frame_id,
                    'pose': self.current_pose.copy(),
                    'keypoints': keypoints,
                    'descriptors': descriptors,
                    'timestamp': time.time(),
                    'section_id': self.current_section_id
                }
                
                # Add to keyframes list
                self.keyframes.append(keyframe)
                
                # Add to current section
                current_section['keyframes'].append(keyframe_id)
                
                # Update keyframe poses
                self.keyframe_poses[keyframe_id] = self.current_pose.copy()
                
                keyframes_added += 1
                
                # Update the point cloud every few keyframes
                if len(self.keyframes) % 5 == 0:
                    self._update_point_cloud()
            
            # Update pose estimation for next frame
            self._update_pose(frame_data)
        
        # Update section information
        self._update_section(self.current_section_id, {
            'frames_processed': current_section.get('frames_processed', 0) + frames_processed,
            'keyframes_added': current_section.get('keyframes_added', 0) + keyframes_added
        })
        
        # Check if we should start a new section
        if keyframes_added > 0 and len(current_section['keyframes']) >= 30:
            self._create_new_section()
        
        # Clean up old frames to save memory
        self._cleanup_old_frames()
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        # Return processing results
        return {
            'status': 'success',
            'frames_processed': frames_processed,
            'keyframes_added': keyframes_added,
            'processing_time': processing_time,
            'current_section_id': self.current_section_id,
            'tracking_lost': self.tracking_lost,
            'has_reconstruction': self.point_cloud is not None
        }
    
    def _should_be_keyframe(self, frame_data: Dict[str, Any]) -> bool:
        """Determine if a frame should be a keyframe"""
        # Always make the first frame a keyframe
        if not self.keyframes:
            return True
        
        # If tracking is lost, make it a keyframe to try to recover
        if self.tracking_lost:
            return True
        
        # If we have enough keyframes, be more selective
        if len(self.keyframes) > 5:
            # Get the last keyframe
            last_keyframe = self.keyframes[-1]
            
            # Calculate feature matching between this frame and the last keyframe
            matches = self._match_features(
                last_keyframe['descriptors'],
                frame_data['descriptors']
            )
            
            # If we have few matches, it's a new perspective - make it a keyframe
            if len(matches) < 15:
                return True
            
            # If we have many matches but significant motion, make it a keyframe
            if len(matches) < 50:
                # Calculate motion between frames
                motion = self._estimate_motion(
                    last_keyframe['keypoints'],
                    frame_data['keypoints'],
                    matches
                )
                
                # If significant motion, make it a keyframe
                if motion > 10.0:
                    return True
            
            # Otherwise, make every 10th frame a keyframe
            return self.last_frame_id % 10 == 0
        
        # For the first few frames, make every 3rd frame a keyframe
        return self.last_frame_id % 3 == 0
    
    def _match_features(self, desc1: np.ndarray, desc2: np.ndarray) -> List[cv2.DMatch]:
        """Match features between two frames"""
        if desc1 is None or desc2 is None:
            return []
        
        # Use FLANN matcher for faster matching
        FLANN_INDEX_LSH = 6
        index_params = dict(algorithm=FLANN_INDEX_LSH, table_number=6, key_size=12, multi_probe_level=1)
        search_params = dict(checks=50)
        
        try:
            flann = cv2.FlannBasedMatcher(index_params, search_params)
            matches = flann.knnMatch(desc1, desc2, k=2)
            
            # Apply ratio test to filter good matches
            good_matches = []
            for match_group in matches:
                if len(match_group) >= 2:
                    m, n = match_group
                    if m.distance < 0.7 * n.distance:
                        good_matches.append(m)
            
            return good_matches
        except Exception as e:
            print(f"Error matching features: {str(e)}")
            
            # Fall back to brute force matcher
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            try:
                matches = bf.match(desc1, desc2)
                return sorted(matches, key=lambda x: x.distance)[:50]
            except Exception as e2:
                print(f"Error with fallback matcher: {str(e2)}")
                return []
    
    def _estimate_motion(self, kp1: List[cv2.KeyPoint], kp2: List[cv2.KeyPoint], 
                         matches: List[cv2.DMatch]) -> float:
        """Estimate motion between two frames based on matched keypoints"""
        if len(matches) < 4:
            return 100.0  # Large motion if too few matches
        
        # Extract matched keypoints
        pts1 = np.float32([kp1[m.queryIdx].pt for m in matches])
        pts2 = np.float32([kp2[m.trainIdx].pt for m in matches])
        
        # Find homography
        H, mask = cv2.findHomography(pts1, pts2, cv2.RANSAC, 5.0)
        
        if H is None:
            return 100.0  # Large motion if homography estimation fails
        
        # Decompose homography to get rotation and translation
        try:
            _, Rs, Ts, Ns = cv2.decomposeHomographyMat(H, np.eye(3))
            
            # Use the first solution
            R = Rs[0]
            T = Ts[0]
            
            # Calculate motion as a combination of rotation and translation
            rot_motion = np.sum(np.abs(R - np.eye(3)))
            trans_motion = np.linalg.norm(T)
            
            return rot_motion + trans_motion
        except Exception as e:
            print(f"Error decomposing homography: {str(e)}")
            return 50.0  # Moderate motion if decomposition fails
    
    def _update_pose(self, frame_data: Dict[str, Any]) -> None:
        """Update the current pose based on the new frame"""
        # Skip if no keyframes yet
        if not self.keyframes:
            self.tracking_lost = False
            return
        
        # Get the last keyframe
        last_keyframe = self.keyframes[-1]
        
        # Match features
        matches = self._match_features(
            last_keyframe['descriptors'],
            frame_data['descriptors']
        )
        
        # If too few matches, tracking might be lost
        if len(matches) < 10:
            self.tracking_lost = True
            return
        
        # Extract matched keypoints
        pts1 = np.float32([last_keyframe['keypoints'][m.queryIdx].pt for m in matches])
        pts2 = np.float32([frame_data['keypoints'][m.trainIdx].pt for m in matches])
        
        # Find essential matrix
        E, mask = cv2.findEssentialMat(pts1, pts2, focal=1.0, pp=(0, 0), method=cv2.RANSAC, prob=0.999, threshold=3.0)
        
        if E is None or mask is None or np.sum(mask) < 5:
            self.tracking_lost = True
            return
        
        # Recover pose
        _, R, T, mask = cv2.recoverPose(E, pts1, pts2, focal=1.0, pp=(0, 0), mask=mask)
        
        if np.sum(mask) < 5:
            self.tracking_lost = True
            return
        
        # Create transformation matrix
        transform = np.eye(4)
        transform[:3, :3] = R
        transform[:3, 3] = T.reshape(3)
        
        # Update current pose
        self.current_pose = np.matmul(self.current_pose, transform)
        self.tracking_lost = False
    
    def _update_point_cloud(self) -> None:
        """Update the point cloud based on keyframes"""
        if len(self.keyframes) < 2:
            return
        
        # For simplicity, we'll create a sparse point cloud from keyframe matches
        points_3d = []
        point_colors = []
        
        # Process pairs of consecutive keyframes
        for i in range(len(self.keyframes) - 1):
            kf1 = self.keyframes[i]
            kf2 = self.keyframes[i + 1]
            
            # Match features
            matches = self._match_features(kf1['descriptors'], kf2['descriptors'])
            
            if len(matches) < 8:
                continue
            
            # Extract matched keypoints
            pts1 = np.float32([kf1['keypoints'][m.queryIdx].pt for m in matches])
            pts2 = np.float32([kf2['keypoints'][m.trainIdx].pt for m in matches])
            
            # Get relative pose between keyframes
            pose1 = kf1['pose']
            pose2 = kf2['pose']
            relative_pose = np.matmul(np.linalg.inv(pose1), pose2)
            
            R = relative_pose[:3, :3]
            T = relative_pose[:3, 3]
            
            # Triangulate points
            P1 = np.eye(3, 4)  # First camera matrix (identity)
            P2 = np.hstack((R, T.reshape(3, 1)))  # Second camera matrix
            
            # Normalize points
            pts1_norm = cv2.undistortPoints(pts1.reshape(-1, 1, 2), np.eye(3), np.zeros(5))
            pts2_norm = cv2.undistortPoints(pts2.reshape(-1, 1, 2), np.eye(3), np.zeros(5))
            
            # Triangulate
            points_4d = cv2.triangulatePoints(P1, P2, pts1_norm, pts2_norm)
            
            # Convert to 3D points
            points_3d_local = points_4d[:3, :] / points_4d[3, :]
            
            # Transform to global coordinate system
            for j in range(points_3d_local.shape[1]):
                point = points_3d_local[:, j]
                
                # Transform point to global coordinates
                global_point = np.matmul(pose1[:3, :3], point) + pose1[:3, 3]
                
                # Add to point cloud
                points_3d.append(global_point)
                
                # Add color (use the color from the first keyframe)
                if isinstance(kf1.get('frame'), np.ndarray):
                    frame = kf1['frame']
                    x, y = int(pts1[j][0]), int(pts1[j][1])
                    if 0 <= y < frame.shape[0] and 0 <= x < frame.shape[1]:
                        color = frame[y, x]
                        point_colors.append(color)
                    else:
                        point_colors.append(np.array([128, 128, 128]))
                else:
                    point_colors.append(np.array([128, 128, 128]))
        
        # Convert to numpy arrays
        if points_3d:
            points_3d = np.array(points_3d).T
            point_colors = np.array(point_colors)
            
            # Store point cloud
            self.point_cloud = {
                'points': points_3d.tolist(),
                'colors': point_colors.tolist()
            }
            
            # Update current section point cloud
            current_section = self._get_current_section()
            current_section['point_cloud'] = self.point_cloud
    
    def _cleanup_old_frames(self) -> None:
        """Clean up old frames to save memory"""
        # Keep only the last 100 frames
        if len(self.frames) > 100:
            self.frames = self.frames[-100:]
    
    def get_reconstruction(self, include_all_sections: bool = False) -> Dict[str, Any]:
        """
        Get the current reconstruction
        
        Args:
            include_all_sections: Whether to include all sections in the reconstruction
            
        Returns:
            dict: Reconstruction data
        """
        if not self.point_cloud:
            return None
        
        if include_all_sections:
            # Combine point clouds from all sections
            all_points = []
            all_colors = []
            
            for section in self.sections:
                if section.get('point_cloud'):
                    section_points = section['point_cloud'].get('points', [])
                    section_colors = section['point_cloud'].get('colors', [])
                    
                    all_points.extend(section_points)
                    all_colors.extend(section_colors)
            
            if not all_points:
                return self.point_cloud
            
            return {
                'points': all_points,
                'colors': all_colors
            }
        else:
            # Return only the current section's point cloud
            current_section = self._get_current_section()
            return current_section.get('point_cloud', self.point_cloud)
    
    def get_sections_info(self) -> List[Dict[str, Any]]:
        """Get information about all sections"""
        sections_info = []
        
        for section in self.sections:
            # Create a copy without the point cloud to reduce size
            section_info = {
                'id': section['id'],
                'created_at': section['created_at'],
                'updated_at': section['updated_at'],
                'frames_processed': section.get('frames_processed', 0),
                'keyframes_added': section.get('keyframes_added', 0),
                'keyframe_count': len(section.get('keyframes', [])),
                'has_point_cloud': section.get('point_cloud') is not None,
                'is_current': section['id'] == self.current_section_id
            }
            
            sections_info.append(section_info)
        
        return sections_info
