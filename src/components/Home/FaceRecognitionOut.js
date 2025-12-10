"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "@/components/CSS/FaceRecognition.module.css";
import { useDatabase } from "@/lib/context";
import { useSelector } from "react-redux";
import ErrorModal from "./ErrorModal";
import * as faceapi from "face-api.js";
import moment from "moment";

// Face recognition configuration
const recognitionSettings = {
  minConfidence: 0.6,
  minSize: 100,
  maxTime: 30000,
  threshold: 0.5,
  distanceMin: 0.3,
  distanceMax: 0.9,
  minDetectionConfidence: 0.5,
};

const recognitionStatus = {
  faceCount: { status: false, val: 0 },
  faceConfidence: { status: false, val: 0 },
  facingCenter: { status: false, val: 0 },
  lookingCenter: { status: true, val: 0 },
  faceSize: { status: false, val: 0 },
  antispoofCheck: { status: true, val: 1 },
  livenessCheck: { status: true, val: 1 },
  distance: { status: false, val: 0 },
  age: { status: false, val: 0 },
  gender: { status: false, val: 0 },
  timeout: { status: true, val: 0 },
  descriptor: { status: false, val: 0 },
  elapsedMs: { status: undefined, val: 0 },
  detectFPS: { status: undefined, val: 0 },
  drawFPS: { status: undefined, val: 0 },
};

const currentFace = { face: null, record: null };
const detected = { detect: 0, draw: 0 };
let startTime = 0;
let detectionInterval = null;

function getCurrentDayOfWeek() {
  const today = moment();
  return today.format("dddd").toLowerCase();
}

const allOk = () =>
  recognitionStatus.faceCount.status &&
  recognitionStatus.faceSize.status &&
  recognitionStatus.facingCenter.status &&
  recognitionStatus.faceConfidence.status &&
  recognitionStatus.antispoofCheck.status &&
  recognitionStatus.livenessCheck.status &&
  recognitionStatus.distance.status &&
  recognitionStatus.descriptor.status &&
  recognitionStatus.age.status &&
  recognitionStatus.gender.status;

// Helper function to calculate Euclidean distance
function euclideanDistance(a, b) {
  if (!a || !b || a.length !== b.length) return 1;
  return Math.sqrt(
    a.reduce((sum, val, i) => sum + Math.pow(val - (b[i] || 0), 2), 0)
  );
}

// Helper function to find best match
function findBestMatch(descriptor, descriptors, threshold = 0.5) {
  if (!descriptors || descriptors.length === 0) {
    return { index: -1, similarity: 0, distance: 1 };
  }

  let bestMatch = { index: -1, distance: Infinity, similarity: 0 };

  descriptors.forEach((desc, index) => {
    if (!desc || desc.length === 0) return;
    const distance = euclideanDistance(descriptor, desc);
    if (distance < bestMatch.distance) {
      bestMatch = { index, distance, similarity: 1 - distance };
    }
  });

  return bestMatch;
}

// Helper to check if face is centered
function isFaceCentered(detection, videoWidth, videoHeight) {
  if (!detection || !detection.box) return false;
  
  const box = detection.box;
  const faceCenterX = box.x + box.width / 2;
  const faceCenterY = box.y + box.height / 2;
  const videoCenterX = videoWidth / 2;
  const videoCenterY = videoHeight / 2;

  const offsetX = Math.abs(faceCenterX - videoCenterX) / videoWidth;
  const offsetY = Math.abs(faceCenterY - videoCenterY) / videoHeight;

  return offsetX < 0.2 && offsetY < 0.2;
}

export default function FaceRecognitionOut() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [outcome, setOutcome] = useState({ type: "", name: "" });
  const retryButtonRef = useRef(null);
  const okContainerRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const { userData, getUser, signRegister } = useDatabase();
  const user = useSelector((state) => state.User.value);
  const faces = userData?.user_faces || [];

  // Load face-api.js models with CDN fallback
  const loadModels = async () => {
    if (modelsLoaded) return true;

    setLoadingStatus("Loading AI models...");

    // Try local models first, then fall back to CDN
    const modelPaths = [
      "/models",
      "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model"
    ];

    for (const MODEL_URL of modelPaths) {
      try {
        console.log(`Attempting to load models from: ${MODEL_URL}`);
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);

        setModelsLoaded(true);
        setLoadingStatus("Models loaded successfully!");
        console.log("Models loaded successfully from:", MODEL_URL);
        return true;
      } catch (error) {
        console.warn(`Failed to load from ${MODEL_URL}:`, error);
        if (MODEL_URL === modelPaths[modelPaths.length - 1]) {
          console.error("All model loading attempts failed");
          setLoadingStatus("Error: Failed to load AI models");
          return false;
        }
      }
    }
    return false;
  };

  // Camera Start
  const webCamStart = async () => {
    try {
      setLoadingStatus("Starting camera...");
      
      const videoConfig = {
        audio: false,
        video: {
          facingMode: "user",
          width: { min: 250, max: 640, ideal: 480 },
          height: { min: 250, max: 480, ideal: 360 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(videoConfig);
      setMediaStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            resolve();
          };
        });

        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        }
        
        setLoadingStatus("Camera ready!");
      }
    } catch (error) {
      console.error("Error starting webcam:", error);
      setLoadingStatus("Error: Camera access denied");
      throw error;
    }
  };

  // Detect and draw video frame
  const detectAndDrawVideo = async () => {
    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
      return;
    }

    try {
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: recognitionSettings.minDetectionConfidence,
      });

      const detections = await faceapi
        .detectAllFaces(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (canvasRef.current) {
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (detections && detections.length > 0) {
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        }
      }

      const timeNow = Date.now();
      recognitionStatus.detectFPS.val = Math.round(1000 / (timeNow - detected.detect));
      detected.detect = timeNow;
    } catch (error) {
      console.error("Detection error:", error);
    }

    if (!isProcessing) {
      requestAnimationFrame(detectAndDrawVideo);
    }
  };

  // Validate Face
  const validationLoop = async () => {
    if (!videoRef.current || videoRef.current.paused) {
      return null;
    }

    try {
      setLoadingStatus("Detecting face...");
      
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: recognitionSettings.minDetectionConfidence,
      });

      const detections = await faceapi
        .detectAllFaces(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withAgeAndGender();

      const timeNow = Date.now();
      recognitionStatus.drawFPS.val = Math.round(1000 / (timeNow - detected.draw));
      detected.draw = timeNow;

      recognitionStatus.faceCount.val = detections?.length || 0;
      recognitionStatus.faceCount.status = recognitionStatus.faceCount.val === 1;

      if (recognitionStatus.faceCount.status && detections[0]) {
        const detection = detections[0];
        const box = detection.detection.box;

        // Face confidence
        recognitionStatus.faceConfidence.val = detection.detection.score;
        recognitionStatus.faceConfidence.status =
          recognitionStatus.faceConfidence.val >= recognitionSettings.minConfidence;

        // Face size
        recognitionStatus.faceSize.val = Math.min(box.width, box.height);
        recognitionStatus.faceSize.status =
          recognitionStatus.faceSize.val >= recognitionSettings.minSize;

        // Face centered
        recognitionStatus.facingCenter.status = isFaceCentered(
          detection.detection,
          videoRef.current.videoWidth,
          videoRef.current.videoHeight
        );

        // Distance estimation (based on face size)
        const normalizedSize =
          recognitionStatus.faceSize.val /
          Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
        recognitionStatus.distance.val = normalizedSize;
        recognitionStatus.distance.status =
          recognitionStatus.distance.val >= recognitionSettings.distanceMin &&
          recognitionStatus.distance.val <= recognitionSettings.distanceMax;

        // Descriptor
        recognitionStatus.descriptor.val = detection.descriptor?.length || 0;
        recognitionStatus.descriptor.status = recognitionStatus.descriptor.val === 128;

        // Age
        recognitionStatus.age.val = detection.age || 0;
        recognitionStatus.age.status = recognitionStatus.age.val > 0;

        // Gender
        recognitionStatus.gender.val = detection.genderProbability || 0;
        recognitionStatus.gender.status =
          recognitionStatus.gender.val >= recognitionSettings.minConfidence;

        // Update status message
        const passedChecks = Object.values(recognitionStatus).filter(s => s.status === true).length;
        setLoadingStatus(`Validating face... (${passedChecks}/10 checks passed)`);
      } else if (recognitionStatus.faceCount.val === 0) {
        setLoadingStatus("No face detected. Please position your face in frame.");
      } else if (recognitionStatus.faceCount.val > 1) {
        setLoadingStatus("Multiple faces detected. Please ensure only you are in frame.");
      }

      // Timeout check
      recognitionStatus.elapsedMs.val = Date.now() - startTime;
      recognitionStatus.timeout.status =
        recognitionStatus.elapsedMs.val <= recognitionSettings.maxTime;

      if (allOk() || !recognitionStatus.timeout.status) {
        if (videoRef.current) {
          videoRef.current.pause();
        }
        setLoadingStatus(allOk() ? "Face validated!" : "Validation timeout");
        return detections[0];
      }

      // Continue validation
      await new Promise((resolve) => setTimeout(resolve, 100));
      return await validationLoop();
    } catch (error) {
      console.error("Validation error:", error);
      setLoadingStatus("Validation error occurred");
      return null;
    }
  };

  // Detect Faces and Match
  const detectFaces = async () => {
    if (!currentFace?.face?.descriptor) {
      console.error("No face descriptor available");
      setLoadingStatus("Error: No face descriptor");
      return false;
    }

    setLoadingStatus("Matching face...");

    const db = faces;
    let descriptors = [];

    if (db && db.length > 0) {
      descriptors = db
        .map((rec) => rec.descriptor)
        .filter((desc) => desc && desc.length > 0);
    }

    const descriptorArray = Array.from(currentFace.face.descriptor);
    const res = findBestMatch(descriptorArray, descriptors, recognitionSettings.threshold);

    currentFace.record = res.index >= 0 ? db[res.index] : null;

    if (
      !currentFace.record &&
      !db.find((elem) => elem.id === user?.code) &&
      res.similarity < recognitionSettings.threshold
    ) {
      setOutcome({
        type: "New",
        name: `${user?.first_name} ${user?.last_name}`,
        apply: " ",
      });
      if (okContainerRef.current) {
        okContainerRef.current.style.display = "none";
      }
      setLoadingStatus("New user detected");
      return false;
    } else if (
      currentFace.record &&
      currentFace.record.id === user?.code &&
      res.similarity > recognitionSettings.threshold
    ) {
      if (okContainerRef.current) {
        okContainerRef.current.style.display = "none";
      }
      if (userData?.attendance && userData.attendance[getCurrentDayOfWeek()]) {
        signRegister(userData.attendance[getCurrentDayOfWeek()], "signout");
      }
      setOutcome({ type: "Success", name: currentFace.record.name });
      setLoadingStatus("Success!");
      return true;
      
    } else if (
      currentFace.record &&
      currentFace.record.id !== user?.code &&
      res.similarity > recognitionSettings.threshold
    ) {
      setOutcome({ type: "Fail", name: currentFace.record.name });
      if (okContainerRef.current) {
        okContainerRef.current.style.display = "none";
      }
      setLoadingStatus("Face mismatch");
      return false;
    } else {
      setOutcome({ type: "Error", name: "Not Found" });
      setLoadingStatus("Face not recognized");
      return false;
    }
  };

  // Save Face Record
  async function saveRecords() {
    if (!currentFace.face?.descriptor) {
      console.error("No descriptor to save");
      return;
    }

    setLoadingStatus("Saving face data...");

    const rec = {
      id: user?.code,
      name: `${user?.first_name} ${user?.last_name}`,
      descriptor: Array.from(currentFace.face.descriptor),
      initial: user?.initial,
    };

    try {
      const response = await fetch("/api/faces", {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: userData.school_code,
          faceRecord: rec,
          methods: "update",
        }),
      });

      const data = await response.json();
      await getUser(userData.school_code);
      setLoadingStatus("Face data saved!");
    } catch (error) {
      console.error("Error saving face:", error);
      setLoadingStatus("Error saving face data");
    }
  }

  // Main Function
  const mainFunc = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Reset UI
      if (okContainerRef.current) {
        okContainerRef.current.style.display = "flex";
      }
      if (retryButtonRef.current) {
        retryButtonRef.current.style.display = "none";
      }

      // Reset status
      Object.keys(recognitionStatus).forEach((key) => {
        if (key !== "lookingCenter" && key !== "antispoofCheck" && key !== "livenessCheck") {
          recognitionStatus[key].status = false;
          recognitionStatus[key].val = 0;
        }
      });

      // Load models if not loaded
      if (!modelsLoaded) {
        const loaded = await loadModels();
        if (!loaded) {
          throw new Error("Failed to load models");
        }
      }

      // Start camera
      await webCamStart();

      // Start detection loop
      detectAndDrawVideo();

      // Start validation
      startTime = Date.now();
      currentFace.face = await validationLoop();

      if (!allOk()) {
        if (okContainerRef.current) {
          okContainerRef.current.style.display = "none";
        }
        if (retryButtonRef.current) {
          retryButtonRef.current.style.display = "block";
        }
        console.log("Did not find valid face");
        setLoadingStatus("Validation failed. Please retry.");
        return false;
      }

      return await detectFaces();
    } catch (error) {
      console.error("Main function error:", error);
      setLoadingStatus("Error occurred. Please retry.");
      if (retryButtonRef.current) {
        retryButtonRef.current.style.display = "block";
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  // Initialize on mount
  useEffect(() => {
    if (!mediaStream && !isProcessing) {
      mainFunc();
    }
  }, []);

  return (
    <div className={styles.Code}>
      <div className={styles.cont}>
        <canvas id="canvas" ref={canvasRef} className={styles.over}></canvas>
        <ErrorModal
          outcome={outcome}
          setOutcome={setOutcome}
          user={user}
          faces={faces}
          saveRecords={saveRecords}
          currentFace={currentFace}
        />
        <video
          id="video"
          className={styles.video}
          ref={videoRef}
          autoPlay
          playsInline
          muted
        ></video>
        {loadingStatus && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 10
          }}>
            {loadingStatus}
          </div>
        )}
      </div>
      <div className={styles.secondPart}>
        <div id="ok" ref={okContainerRef} className={styles.over1}>
          <p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
            </svg>{" "}
            Please make sure you are in a well lit area
          </p>
          <p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
            </svg>{" "}
            Avoid cluster in the background
          </p>
          <p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
            </svg>{" "}
            Bring the camera closer to your face
          </p>
          <p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
            </svg>
            Do not smile
          </p>
        </div>
        <div onClick={mainFunc} ref={retryButtonRef} className={styles.retry}>
          RETRY
        </div>
      </div>
    </div>
  );
}