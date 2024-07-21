import React, { useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import * as THREE from 'three';

import './App.css';

function BodyTracking() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const threeRef = useRef(null);
  const sphereRef = useRef(null);

  useEffect(() => {
    async function setupCamera() {
      const video = videoRef.current;
      video.width = 640;
      video.height = 480;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        video.srcObject = stream;

        return new Promise((resolve) => {
          video.onloadedmetadata = () => {
            resolve(video);
          };
        });
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    }

    async function loadPosenet() {
      const net = await posenet.load();
      return net;
    }

    async function detect(net) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      async function poseDetectionFrame() {
        const pose = await net.estimateSinglePose(video, {
          flipHorizontal: false,
        });
        console.log("🚀 ~ poseDetectionFrame ~ pose:", pose.keypoints[0].position)

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        drawKeypoints(pose['keypoints'], context);
        drawSkeleton(pose['keypoints'], context);

        requestAnimationFrame(poseDetectionFrame);
      }

      poseDetectionFrame();
    }

    setupCamera().then(async () => {
      const net = await loadPosenet();
      detect(net);
    });
  }, []);

  useEffect(() => {
    function initThreeJS() {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1500);
      const renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(640, 480);
      renderer.setClearColor(0x000000, 0); // Set clear color with alpha 0

      threeRef.current.appendChild(renderer.domElement);

      const geometry = new THREE.BoxGeometry( 1, 1, 1 );
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00});
      const sphere = new THREE.Mesh(geometry, material);
      sphereRef.current = sphere;
      scene.add(sphere);
      sphere.position.x = 1;
      camera.position.z = 5;

      const animate = function () {
        requestAnimationFrame(animate);

        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;

        renderer.render(scene, camera);
      };

      animate();
    }

    initThreeJS();
  }, []);

  
  const drawKeypoints = (keypoints, context) => {
    keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.5) {
        const { y, x } = keypoint.position;
        context.beginPath();
        context.arc(x, y, 5, 0, 2 * Math.PI);
        context.fillStyle = 'red';
        context.fill();
      }
    });
  };

  const drawSkeleton = (keypoints, context) => {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, 0.5);

    adjacentKeyPoints.forEach((keypoints) => {
      drawSegment(
        toTuple(keypoints[0].position),
        toTuple(keypoints[1].position),
        'green',
        2,
        context
      );
    });
  };

  const toTuple = ({ y, x }) => {
    return [y, x];
  };

  const drawSegment = ([ay, ax], [by, bx], color, lineWidth, context) => {
    context.beginPath();
    context.moveTo(ax, ay);
    context.lineTo(bx, by);
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.stroke();
  };

  

  return (
    <div className="container">
      <video ref={videoRef} autoPlay playsInline muted className="video" />
      <canvas ref={canvasRef} width="640" height="480" className="canvas" />
      <div className="scene" ref={threeRef} />
    </div>
  );
}

export default BodyTracking;
