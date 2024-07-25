// import React, { useRef, useEffect } from 'react';
// import * as tf from '@tensorflow/tfjs';
// import * as posenet from '@tensorflow-models/posenet';
// import * as THREE from 'three';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// import './App.css';
// import TestItem from './testitem';

// function BodyTracking() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const threeRef = useRef(null);
//   const scene = useRef(new THREE.Scene());
//   const camera = useRef(new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1500));
//   const renderer = useRef(new THREE.WebGLRenderer({ alpha: true }));
//   const model = useRef(null);

//   useEffect(() => {
//     async function setupCamera() {
//       const video = videoRef.current;
//       video.width = 640;
//       video.height = 480;
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         video.srcObject = stream;
//         return new Promise((resolve) => {
//           video.onloadedmetadata = () => resolve(video);
//         });
//       } catch (err) {
//         console.error("Error accessing webcam: ", err);
//       }
//     }

//     async function loadPosenet() {
//       const net = await posenet.load();
//       return net;
//     }

//     async function detect(net) {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       const context = canvas.getContext('2d');

//       async function poseDetectionFrame() {
//         const pose = await net.estimateSinglePose(video, { flipHorizontal: false });
//         context.clearRect(0, 0, canvas.width, canvas.height);
//         context.drawImage(video, 0, 0, canvas.width, canvas.height);
//         drawKeypoints(pose['keypoints'], context);
//         drawSkeleton(pose['keypoints'], context);
        
//         const noseKeypoint = pose.keypoints.find(k => k.part === 'nose');
//         const leftShoulder = pose.keypoints.find(k => k.part === 'leftShoulder');
//         const rightShoulder = pose.keypoints.find(k => k.part === 'rightShoulder');
//         const lefthip = pose.keypoints.find(k => k.part === 'leftHip');
//         const leftEye = pose.keypoints.find(k => k.part === 'leftEye');
//         const rightEye = pose.keypoints.find(k => k.part === 'rightEye');
        
//         if (noseKeypoint && noseKeypoint.score > 0.5 && leftShoulder && lefthip && leftShoulder.score > 0.5 && lefthip.score > 0.5) {
//           updateModelPosition(noseKeypoint.position);
//           updateModelScale(leftShoulder.position, lefthip.position);
//            updateModelZRotation(leftEye.position, rightEye.position);
//           //  updateModelYRotation(leftShoulder.position, rightShoulder.position)
//         }

//         requestAnimationFrame(poseDetectionFrame);
//       }

//       poseDetectionFrame();
//     }

//     setupCamera().then(async () => {
//       const net = await loadPosenet();
//       detect(net);
//     });

//     function initThreeJS() {
//       renderer.current.setSize(640, 480);
//       renderer.current.setClearColor(0x000000, 0);
//       threeRef.current.appendChild(renderer.current.domElement);

//       const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//       directionalLight.position.set(1, 1, 1);
//       scene.current.add(directionalLight);

//       const loader = new OBJLoader();
//       loader.load(
//         '/Mask02.obj',
//         function (object) {
//           model.current = object;
//           scene.current.add(model.current);
//           model.current.scale.set(0, 0, 0); // Initial scale
//           console.log("🚀 ~ initThreeJS ~ model.current:", model.current.rotation)
//         },
//         undefined,
//         function (error) {
//           console.error('Error loading OBJ file:', error);
//         }
//       );

//       camera.current.position.set(0, 0, 1000);
//       const ambientLight = new THREE.AmbientLight(0x404040, 1);
//       scene.current.add(ambientLight);

//       const animate = function () {
//         requestAnimationFrame(animate);
//         renderer.current.render(scene.current, camera.current);
//       };

//       animate();
//     }

//     initThreeJS();
//   }, []);

//   const updateModelPosition = (nosePosition) => {
//     const { x, y } = nosePosition;
//     const normalizedX = (x / videoRef.current.width) * 2 - 1;
//     const normalizedY = -(y / videoRef.current.height) * 2 + 1;

//     const vector = new THREE.Vector3(normalizedX, normalizedY, 0.5);
//     vector.unproject(camera.current);
//     const dir = vector.sub(camera.current.position).normalize();
//     const distance = -camera.current.position.z / dir.z;
//     const pos = camera.current.position.clone().add(dir.multiplyScalar(distance));

//     model.current.position.x = pos.x;
//     model.current.position.y = pos.y;
//   };

//   const updateModelScale = (leftShoulderPosition, leftHipPosition) => {
//     let scaleFactor = 1;
//     const distance = Math.sqrt(
//       Math.pow(leftHipPosition.x - leftShoulderPosition.x, 2) +
//       Math.pow(leftHipPosition.y - leftShoulderPosition.y, 2)
//     )*scaleFactor;
//     // Scale factor might need adjustment for visual correctness
    
//     const scale = Math.max(.00001, distance / 1500) ;
//     model.current.scale.set(scale, scale, scale);
//   };
//   const updateModelZRotation = (leftEyePosition, rightEyePosition) => {
//     const dx = rightEyePosition.x - leftEyePosition.x;
//     const dy = rightEyePosition.y - leftEyePosition.y;
//     const angle = Math.atan2(dy, dx);
//     model.current.rotation.z = -angle; // Adjust the model's z-axis rotation
//   };
//   const updateModelYRotation = (leftShoulderPosition, rightShoulderPosition) => {
  
//     let rotationFactor = -0.05;
//     const distance = Math.sqrt(
//       Math.pow(rightShoulderPosition.x - leftShoulderPosition.x, 2) +
//       Math.pow(rightShoulderPosition.y - leftShoulderPosition.y, 2)
//     )*rotationFactor;
//     // Rotation factor might need adjustment for visual correctness

//     model.current.rotation.y = -distance; // Adjust the model's z-axis rotation
//     console.log("🚀 ~ updateModelYRotation ~ distance:", distance)
//   };

//   const drawKeypoints = (keypoints, context) => {
//     keypoints.forEach((keypoint) => {
//       if (keypoint.score > 0.5) {
//         const { x, y } = keypoint.position;
//         context.beginPath();
//         context.arc(x, y, 5, 0, 2 * Math.PI);
//         context.fillStyle = 'red';
//         context.fill();
//       }
//     });
//   };

//   const drawSkeleton = (keypoints, context) => {
//     const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, 0.5);
//     adjacentKeyPoints.forEach((keypoints) => {
//       drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[1].position), 'green', 2, context);
//     });
//   };

//   const toTuple = ({ x, y }) => [x, y];

//   const drawSegment = ([ax, ay], [bx, by], color, lineWidth, context) => {
//     context.beginPath();
//     context.moveTo(ax, ay);
//     context.lineTo(bx, by);
//     context.lineWidth = lineWidth;
//     context.strokeStyle = color;
//     context.stroke();
//   };
//   return (
//     <div className="container">
//       <video ref={videoRef} autoPlay playsInline muted className="video" />
//       <canvas ref={canvasRef} width="640" height="480" className="canvas" />
//       <div ref={threeRef} className="scene" />

//       <TestItem></TestItem>
//     </div>
//   );
// }

// export default BodyTracking;
