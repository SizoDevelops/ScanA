"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "@/components/CSS/FaceRecognition.module.css";
import { useDatabase } from "@/lib/context";
import { useSelector } from "react-redux";
import ErrorModal from "./ErrorModal";
import * as H from "@vladmandic/human";
import moment from "moment";

// Human library configuration - PRODUCTION READY
const humanConfig = {
  backend: "webgl",
  modelBasePath: "https://cdn.jsdelivr.net/npm/@vladmandic/human/models",
  filter: { enabled: true, equalization: true },
  face: {
    enabled: true,
    detector: { 
      rotation: true, 
      return: true, 
      mask: false,
      maxDetected: 1
    },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: false },
    antispoof: { enabled: true },
    liveness: { enabled: true },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: true },
};

// Face recognition settings - STRICT
const recognitionSettings = {
  minConfidence: 0.7,
  minSize: 150,
  maxTime: 30000,
  threshold: 0.35, // Distance threshold (lower = stricter)
  distanceMin: 0.3,
  distanceMax: 1.0,
  minSimilarityScore: 0.65, // 65% similarity required
  requireMultipleSamples: 3,
  antispoofThreshold: 0.7,
  livenessThreshold: 0.7,
};

const recognitionStatus = {
  faceCount: { status: false, val: 0 },
  faceConfidence: { status: false, val: 0 },
  facingCenter: { status: false, val: 0 },
  lookingCenter: { status: true, val: 0 },
  faceSize: { status: false, val: 0 },
  antispoofCheck: { status: false, val: 0 },
  livenessCheck: { status: false, val: 0 },
  distance: { status: false, val: 0 },
  age: { status: false, val: 0 },
  gender: { status: false, val: 0 },
  timeout: { status: true, val: 0 },
  descriptor: { status: false, val: 0 },
  elapsedMs: { status: undefined, val: 0 },
  detectFPS: { status: undefined, val: 0 },
  drawFPS: { status: undefined, val: 0 },
};

const currentFace = { face: null, record: null, samples: [] };
const detected = { detect: 0, draw: 0 };
let startTime = 0;
let human = null;

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

// Cosine similarity (better for face recognition)
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (normA * normB);
}

// Euclidean distance
function euclideanDistance(a, b) {
  if (!a || !b || a.length !== b.length) return 1;
  
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  
  return Math.sqrt(sum);
}

// Enhanced face matching with multiple samples
function findBestMatch(descriptor, faceRecords, threshold = 0.35) {
  if (!faceRecords || faceRecords.length === 0) {
    return { index: -1, similarity: 0, distance: 1 };
  }

  let bestMatch = { 
    index: -1, 
    distance: Infinity, 
    similarity: 0,
    cosineSim: 0,
  };

  const allResults = [];

  faceRecords.forEach((record, recordIndex) => {
    const descriptors = Array.isArray(record.descriptors) 
      ? record.descriptors 
      : [record.descriptor];

    const similarities = [];
    const distances = [];
    
    descriptors.forEach((storedDesc) => {
      if (!storedDesc || storedDesc.length === 0) return;
      
      const cosine = cosineSimilarity(descriptor, storedDesc);
      const euclidean = euclideanDistance(descriptor, storedDesc);
      
      similarities.push(cosine);
      distances.push(euclidean);
    });

    if (similarities.length === 0) return;

    // Average top similarities
    similarities.sort((a, b) => b - a);
    const topSimilarities = similarities.slice(0, Math.min(3, similarities.length));
    const avgCosineSim = topSimilarities.reduce((a, b) => a + b, 0) / topSimilarities.length;
    
    const cosineDistance = 1 - avgCosineSim;
    const minEuclidean = Math.min(...distances);
    
    // Combined score
    const combinedScore = (cosineDistance * 0.6) + (minEuclidean * 0.4);
    
    allResults.push({
      index: recordIndex,
      name: record.name,
      id: record.id,
      cosineSim: avgCosineSim,
      euclideanDist: minEuclidean,
      combinedScore: combinedScore,
      similarity: 1 - combinedScore,
      numSamples: similarities.length
    });

    if (combinedScore < bestMatch.distance) {
      bestMatch = {
        index: recordIndex,
        distance: combinedScore,
        similarity: 1 - combinedScore,
        cosineSim: avgCosineSim,
        euclideanDist: minEuclidean,
        numSamples: similarities.length
      };
    }
  });

  allResults.sort((a, b) => b.similarity - a.similarity);

  console.log("🔍 Face Matching Analysis:", {
    bestMatch: {
      found: bestMatch.index >= 0,
      index: bestMatch.index,
      name: allResults[0]?.name,
      similarity: (bestMatch.similarity * 100).toFixed(2) + '%',
      cosineSimilarity: (bestMatch.cosineSim * 100).toFixed(2) + '%',
      euclideanDistance: bestMatch.euclideanDist?.toFixed(4),
      combinedScore: bestMatch.distance.toFixed(4),
      numSamples: bestMatch.numSamples,
      passesThreshold: bestMatch.distance < threshold && bestMatch.cosineSim >= recognitionSettings.minSimilarityScore
    },
    topMatches: allResults.slice(0, 3).map(r => ({
      name: r.name,
      similarity: (r.similarity * 100).toFixed(2) + '%',
      cosine: (r.cosineSim * 100).toFixed(2) + '%',
    })),
    threshold: threshold,
    minSimilarityRequired: (recognitionSettings.minSimilarityScore * 100) + '%'
  });

  if (bestMatch.distance >= threshold || bestMatch.cosineSim < recognitionSettings.minSimilarityScore) {
    return { index: -1, similarity: 0, distance: bestMatch.distance };
  }

  return bestMatch;
}

// Check if face is centered
function isFaceCentered(face, videoWidth, videoHeight) {
  if (!face || !face.box) return false;
  
  const box = face.box;
  const faceCenterX = box[0] + box[2] / 2;
  const faceCenterY = box[1] + box[3] / 2;
  const videoCenterX = videoWidth / 2;
  const videoCenterY = videoHeight / 2;

  const offsetX = Math.abs(faceCenterX - videoCenterX) / videoWidth;
  const offsetY = Math.abs(faceCenterY - videoCenterY) / videoHeight;

  return offsetX < 0.12 && offsetY < 0.12;
}

export default function FaceRecognition() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [outcome, setOutcome] = useState({ type: "", name: "" });
  const retryButtonRef = useRef(null);
  const okContainerRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [capturingSamples, setCapturingSamples] = useState(false);
  const [samplesCollected, setSamplesCollected] = useState(0);
  const { userData, getUser, signRegister } = useDatabase();
  const user = useSelector((state) => state.User.value);
  const faces = userData?.user_faces || [];

  // Initialize Human library
  const loadModels = async () => {
    if (modelsLoaded && human) return true;

    setLoadingStatus("Loading AI models...");

    try {
      human = new H.Human(humanConfig);
      await human.load();
      await human.warmup();
      
      setModelsLoaded(true);
      setLoadingStatus("Models loaded successfully!");
      console.log("Human library initialized:", human.version);
      return true;
    } catch (error) {
      console.error("Error loading Human library:", error);
      setLoadingStatus("Error: Failed to load AI models");
      return false;
    }
  };

  // Camera Start
  const webCamStart = async () => {
    try {
      setLoadingStatus("Starting camera...");
      
      const videoConfig = {
        audio: false,
        video: {
          facingMode: "user",
          width: { min: 640, max: 1280, ideal: 640 },
          height: { min: 480, max: 720, ideal: 480 },
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
    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended || !human) {
      return;
    }

    try {
      const result = await human.detect(videoRef.current);
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        human.draw.canvas(videoRef.current, canvasRef.current);
        await human.draw.all(canvasRef.current, result);
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

  // Capture multiple face samples
  const captureMultipleSamples = async () => {
    setCapturingSamples(true);
    setSamplesCollected(0);
    currentFace.samples = [];

    setLoadingStatus("Please slowly turn your head left and right...");

    for (let i = 0; i < recognitionSettings.requireMultipleSamples; i++) {
      setLoadingStatus(`Capturing sample ${i + 1}/${recognitionSettings.requireMultipleSamples}...`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await human.detect(videoRef.current);

      if (result.face && result.face.length > 0 && result.face[0].embedding) {
        currentFace.samples.push(Array.from(result.face[0].embedding));
        setSamplesCollected(i + 1);
      } else {
        i--;
        setLoadingStatus(`Sample failed, retrying ${i + 1}/${recognitionSettings.requireMultipleSamples}...`);
      }
    }

    setCapturingSamples(false);
    setLoadingStatus(`${recognitionSettings.requireMultipleSamples} samples captured!`);
    return currentFace.samples;
  };

  // Validate Face
  const validationLoop = async () => {
    if (!videoRef.current || videoRef.current.paused || !human) {
      return null;
    }

    try {
      setLoadingStatus("Detecting face...");
      
      const result = await human.detect(videoRef.current);

      const timeNow = Date.now();
      recognitionStatus.drawFPS.val = Math.round(1000 / (timeNow - detected.draw));
      detected.draw = timeNow;

      recognitionStatus.faceCount.val = result.face?.length || 0;
      recognitionStatus.faceCount.status = recognitionStatus.faceCount.val === 1;

      if (recognitionStatus.faceCount.status && result.face[0]) {
        const face = result.face[0];

        // Gestures for face direction
        const gestures = result.gesture?.map(g => g.gesture) || [];
        recognitionStatus.facingCenter.status = gestures.includes("facing center");
        recognitionStatus.lookingCenter.status = gestures.includes("looking center");

        // Face confidence
        recognitionStatus.faceConfidence.val = face.faceScore || face.boxScore || 0;
        recognitionStatus.faceConfidence.status =
          recognitionStatus.faceConfidence.val >= recognitionSettings.minConfidence;

        // Face size
        recognitionStatus.faceSize.val = Math.min(face.box[2], face.box[3]);
        recognitionStatus.faceSize.status =
          recognitionStatus.faceSize.val >= recognitionSettings.minSize;

        // Antispoof check
        recognitionStatus.antispoofCheck.val = face.real || 0;
        recognitionStatus.antispoofCheck.status =
          recognitionStatus.antispoofCheck.val >= recognitionSettings.antispoofThreshold;

        // Liveness check
        recognitionStatus.livenessCheck.val = face.live || 0;
        recognitionStatus.livenessCheck.status =
          recognitionStatus.livenessCheck.val >= recognitionSettings.livenessThreshold;

        // Distance
        recognitionStatus.distance.val = face.distance || 0;
        recognitionStatus.distance.status =
          recognitionStatus.distance.val >= recognitionSettings.distanceMin &&
          recognitionStatus.distance.val <= recognitionSettings.distanceMax;

        // Descriptor
        recognitionStatus.descriptor.val = face.embedding?.length || 0;
        recognitionStatus.descriptor.status = recognitionStatus.descriptor.val > 0;

        // Age
        recognitionStatus.age.val = face.age || 0;
        recognitionStatus.age.status = recognitionStatus.age.val > 0;

        // Gender
        recognitionStatus.gender.val = face.genderScore || 0;
        recognitionStatus.gender.status =
          recognitionStatus.gender.val >= recognitionSettings.minConfidence;

        const passedChecks = Object.values(recognitionStatus).filter(s => s.status === true).length;
        setLoadingStatus(`Validating... (${passedChecks}/10 checks)`);
      } else if (recognitionStatus.faceCount.val === 0) {
        setLoadingStatus("No face detected");
      } else if (recognitionStatus.faceCount.val > 1) {
        setLoadingStatus("Multiple faces detected");
      }

      recognitionStatus.elapsedMs.val = Date.now() - startTime;
      recognitionStatus.timeout.status =
        recognitionStatus.elapsedMs.val <= recognitionSettings.maxTime;

      if (allOk() || !recognitionStatus.timeout.status) {
        if (videoRef.current) {
          videoRef.current.pause();
        }
        setLoadingStatus(allOk() ? "Face validated!" : "Validation timeout");
        return result.face[0];
      }

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
    if (!currentFace?.face?.embedding) {
      console.error("No face descriptor available");
      setLoadingStatus("Error: No face descriptor");
      return false;
    }

    setLoadingStatus("Matching face...");

    const descriptorArray = Array.from(currentFace.face.embedding);
    const res = findBestMatch(descriptorArray, faces, recognitionSettings.threshold);

    currentFace.record = res.index >= 0 ? faces[res.index] : null;

    // Case 1: No match found and user not registered
    if (res.index === -1 && !faces.find((elem) => elem.id === user?.code)) {
      setOutcome({
        type: "New",
        name: `${user?.first_name} ${user?.last_name}`,
        apply: " ",
      });
      if (okContainerRef.current) {
        okContainerRef.current.style.display = "none";
      }
      setLoadingStatus("New user - please register");
      return false;
    }
    
    // Case 2: Match found and it's the correct user
    if (currentFace.record && currentFace.record.id === user?.code) {
      if (okContainerRef.current) {
        okContainerRef.current.style.display = "none";
      }
      if (userData?.attendance && userData.attendance[getCurrentDayOfWeek()]) {
        signRegister(userData.attendance[getCurrentDayOfWeek()], "signout");
      }
      setOutcome({ type: "Success", name: currentFace.record.name });
      setLoadingStatus("✅ Success!");
      return true;
    }
    
    // Case 3: Match found but it's a different user
    if (currentFace.record && currentFace.record.id !== user?.code) {
      setOutcome({ 
        type: "Fail", 
        name: `Wrong Person!\nDetected: ${currentFace.record.name}` 
      });
      if (okContainerRef.current) {
        okContainerRef.current.style.display = "none";
      }
      setLoadingStatus("Face mismatch");
      return false;
    }
    
    // Case 4: No match
    setOutcome({ 
      type: "Error", 
      name: "Face not recognized. Similarity too low. Please re-register." 
    });
    setLoadingStatus("Face not recognized");
    return false;
  };

  // Save Face Record with multiple samples
  async function saveRecords() {
    if (!currentFace.face?.embedding && currentFace.samples.length === 0) {
      console.error("No descriptor to save");
      return;
    }

    setLoadingStatus("Preparing to capture multiple face samples...");

    const samples = await captureMultipleSamples();

    if (samples.length < recognitionSettings.requireMultipleSamples) {
      setLoadingStatus("Failed to capture enough samples");
      return;
    }

    setLoadingStatus("Saving face data...");

    const rec = {
      id: user?.code,
      name: `${user?.first_name} ${user?.last_name}`,
      descriptors: samples,
      descriptor: samples[0],
      initial: user?.initial,
      registeredAt: new Date().toISOString(),
      numSamples: samples.length
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
      setLoadingStatus("Face registered with " + samples.length + " samples!");
      setOutcome({ type: "Success", name: "Face registered successfully!" });
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
      if (okContainerRef.current) {
        okContainerRef.current.style.display = "flex";
      }
      if (retryButtonRef.current) {
        retryButtonRef.current.style.display = "none";
      }

      Object.keys(recognitionStatus).forEach((key) => {
        if (key !== "lookingCenter") {
          recognitionStatus[key].status = false;
          recognitionStatus[key].val = 0;
        }
      });

      if (!modelsLoaded) {
        const loaded = await loadModels();
        if (!loaded) {
          throw new Error("Failed to load models");
        }
      }

      await webCamStart();
      detectAndDrawVideo();

      startTime = Date.now();
      currentFace.face = await validationLoop();

      if (!allOk()) {
        if (okContainerRef.current) {
          okContainerRef.current.style.display = "none";
        }
        if (retryButtonRef.current) {
          retryButtonRef.current.style.display = "block";
        }
        setLoadingStatus("Validation failed");
        return false;
      }

      return await detectFaces();
    } catch (error) {
      console.error("Main function error:", error);
      setLoadingStatus("Error occurred");
      if (retryButtonRef.current) {
        retryButtonRef.current.style.display = "block";
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

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
            zIndex: 10,
            maxWidth: '300px'
          }}>
            {loadingStatus}
            {capturingSamples && (
              <div style={{ marginTop: '5px', fontSize: '10px' }}>
                Samples: {samplesCollected}/{recognitionSettings.requireMultipleSamples}
              </div>
            )}
          </div>
        )}
      </div>
      <div className={styles.secondPart}>
        <div id="ok" ref={okContainerRef} className={styles.over1}>
          <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
            </svg> Ensure good, even lighting
          </p>
          <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
            </svg> Remove glasses if possible
          </p>
          <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
            </svg> Position face in center of frame
          </p>
          <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
            </svg> Keep a neutral expression
          </p>
        </div>
        <div onClick={mainFunc} ref={retryButtonRef} className={styles.retry}>
          RETRY
        </div>
      </div>
    </div>
  );
}