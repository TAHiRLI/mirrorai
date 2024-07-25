import React, { useRef, useEffect, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';

function PoseApp() {
  const videoRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [z, setZ] =  useState("null")
  useEffect(() => {
    async function setupDetector() {
      console.log("Pose started")
      await tf.setBackend('webgl');
      console.log("Pose started backend")

      await tf.ready();
      console.log("Pose started backend ready")

      const model = poseDetection.SupportedModels.BlazePose;
      const detectorConfig = {
        runtime: 'tfjs', // 'tfjs' for TensorFlow.js runtime
        modelType: 'lite', // 'lite', 'full', or 'heavy'
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
            console.log( poses[0]?.keypoints3D?.find(x=> x.name==="nose")?.z )
            setZ(poses[0]?.keypoints3D?.find(x=> x.name==="nose")?.z)
            requestAnimationFrame(() => {});
          }
        };
      };

      startVideo();
    }
  }, [detector]);

  return (
    <div className="App">
      <h1>Pose Detection Z= {z}</h1>
      <video ref={videoRef} autoPlay width={500} height={400} />
    </div>
  );
}

export default PoseApp;
