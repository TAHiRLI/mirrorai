import React, { useRef, useEffect, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import * as THREE from 'three';

function PoseApp() {
  const videoRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [scene, setScene] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [camera, setCamera] = useState(null);
  const [box, setBox] = useState(null);
  const [leftbox, setLeftBox] = useState(null);

  useEffect(() => {
    async function setupDetector() {
      await tf.setBackend('webgl');
      await tf.ready();
      const model = poseDetection.SupportedModels.BlazePose;
      const detectorConfig = {
        runtime: 'tfjs',
        modelType: 'heavy',
      };
      const newDetector = await poseDetection.createDetector(model, detectorConfig);
      setDetector(newDetector);
    }

    setupDetector();
  }, []);

  useEffect(() => {
    if (detector) {
      const video = videoRef.current;
      video.width = 640;
      video.height = 480;

      const startVideo = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          
        });
        video.srcObject = stream;

        video.onloadeddata = async () => {
          while (video.readyState >= 2) {
            const poses = await detector.estimatePoses(video);
            if (poses.length > 0) {
              const rightWrist = poses[0]?.keypoints3D?.find(point => point.name === "right_wrist");
              const leftWrist = poses[0]?.keypoints3D?.find(point => point.name === "left_wrist");
              if (rightWrist) {
                box.position.set(rightWrist.x *-5,rightWrist.y *-5, rightWrist.z *-5); // Adjust based on your coordinate system
                leftbox.position.set(leftWrist.x *-5,leftWrist.y *-5, leftWrist.z *-5); // Adjust based on your coordinate system
              }
            }
            renderer.render(scene, camera);
            requestAnimationFrame(() => {});
          }
        };
      };

      startVideo();
    }
  }, [detector]);

  useEffect(() => {
    // Setup Three.js Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add a 3D Box
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const materialleft = new THREE.MeshBasicMaterial({ color: 0xdddd });
    const box = new THREE.Mesh(geometry, material);
    const leftbox = new THREE.Mesh(geometry, materialleft);
    scene.add(box);
    scene.add(leftbox);
    camera.position.z = 5;

    // Set State
    setScene(scene);
    setCamera(camera);
    setRenderer(renderer);
    setBox(box);
    setLeftBox(leftbox)
  }, []);

  return (
    <div className="App">
      <video ref={videoRef} className='flip-horizontal' autoPlay width={500} height={400} />
    </div>
  );
}

export default PoseApp;
