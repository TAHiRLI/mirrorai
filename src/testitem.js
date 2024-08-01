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
  const joints = useRef([]);
  const bones = useRef([]);

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
              poses[0].keypoints3D.forEach((point, index) => {
                if (joints.current[index]) {
                  joints.current[index].position.set(point.x * -5, point.y * -5, point.z * -5);
                }

                // update bones
                // updateBones(poses[0].keypoints3D)
              });
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
    const renderer = new THREE.WebGLRenderer({alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(0x000000, 1); // Set clear color with alpha 0

    // Create joints for the skeleton
    const jointGeometry = new THREE.SphereGeometry(0.1);
    const jointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    for (let i = 0; i < 33; i++) { // Assume 33 keypoints from BlazePose
      const joint = new THREE.Mesh(jointGeometry, jointMaterial);
      scene.add(joint);
      joints.current.push(joint);
    }

    // add bones 
    const boneMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    for (let i = 0; i < 32; i++) { // Creating one less bone than joints
      const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1), boneMaterial);
      // scene.add(bone);
      bones.current.push(bone);
    }

    camera.position.z = 8;

    // Set State
    setScene(scene);
    setCamera(camera);
    setRenderer(renderer);
  }, []);

  const updateBones = (keypoints3D) => {
    bones.current.forEach((bone, index) => {
      if (keypoints3D[index] && keypoints3D[index + 1]) {
        const joint1 = joints.current[index].position;
        const joint2 = joints.current[index + 1].position;
        const distance = joint1.distanceTo(joint2);

        bone.position.set(
          (joint1.x + joint2.x) / -2,
          (joint1.y + joint2.y) / -2,
          (joint1.z + joint2.z) / 2
        );

        bone.scale.set(1, distance, 1);

        bone.lookAt(joint2);
      }
    });
  };


  return (
    <div className="App">
      <video ref={videoRef} className='flip-horizontal' autoPlay width={500} height={400} />
    </div>
  );
}

export default PoseApp;
