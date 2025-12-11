"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "@/components/CSS/FaceRecognition.module.css";
import { useDatabase } from "@/lib/context";
import { useSelector } from "react-redux";
import ErrorModal from "./ErrorModal";
import moment from "moment";

// Dynamically import Human only on client side
let Human = null;
let humanInstance = null;

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
      maxDetected: 1,
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
  minSize: 80,
  maxTime: 30000,
  threshold: 0.55,
  maxFaces: 1,
  distanceMin: 0.3,
  distanceMax: 1,
  minSimilarityScore: 0.65,
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
  timeout: { status: true, val: 0 },
  descriptor: { status: false, val: 0 },
  elapsedMs: { status: undefined, val: 0 },
  detectFPS: { status: undefined, val: 0 },
  drawFPS: { status: undefined, val: 0 },
};

const currentFace = { face: null, record: null, samples: [] };
const detected = { detect: 0, draw: 0 };
let startTime = 0;

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
  recognitionStatus.descriptor.status

// Cosine similarity
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

// Enhanced face matching
function normalize(vec) {
  const norm = Math.hypot(...vec);
  return vec.map(v => v / norm);
}

function findBestMatch(descriptor, faceRecords, threshold = 0.65) {
  if (!faceRecords || faceRecords.length === 0) {
    return { 
      found: false,
      index: -1, 
      similarity: 0, 
      distance: 1,
      passesThreshold: false 
    };
  }

  const query = normalize(Array.from(descriptor));

  let bestMatch = {
    index: -1,
    similarity: 0,
    cosineSim: 0,
    euclideanDist: Infinity,
    numSamples: 0,
  };

  const allResults = [];

  faceRecords.forEach((record, recordIndex) => {
    let descriptorsArray;

    if (Array.isArray(record.descriptors)) {
      descriptorsArray = record.descriptors.map(d => normalize(Array.from(d)));
    } else if (record.descriptors && typeof record.descriptors === "object") {
      descriptorsArray = Object.values(record.descriptors).map(d =>
        normalize(Array.from(d))
      );
    } else if (record.descriptor) {
      descriptorsArray = [normalize(Array.from(record.descriptor))];
    } else {
      descriptorsArray = [];
    }

    if (descriptorsArray.length === 0) return;

    const cosineScores = [];
    const euclideanScores = [];

    descriptorsArray.forEach(stored => {
      const cosine = cosineSimilarity(query, stored);
      const euclidean = euclideanDistance(query, stored);
      cosineScores.push(cosine);
      euclideanScores.push(euclidean);
    });

    cosineScores.sort((a, b) => b - a);
    const topCos = cosineScores.slice(0, 3);
    const avgCosine = topCos.reduce((a, b) => a + b, 0) / topCos.length;

    const minEuc = Math.min(...euclideanScores);
    const eucNorm = 1 - Math.min(minEuc, 1.2) / 1.2;

    const combined = avgCosine * 0.8 + eucNorm * 0.2;

    allResults.push({
      index: recordIndex,
      name: record.name,
      id: record.id,
      cosineSim: avgCosine,
      euclideanDist: minEuc,
      combinedScore: combined,
      similarity: combined,
      numSamples: descriptorsArray.length,
    });

    if (combined > bestMatch.similarity) {
      bestMatch = {
        index: recordIndex,
        similarity: combined,
        cosineSim: avgCosine,
        euclideanDist: minEuc,
        numSamples: descriptorsArray.length,
        name: record.name,
        id: record.id,
      };
    }
  });

  allResults.sort((a, b) => b.similarity - a.similarity);

  // ✅ FIX: Correctly check threshold and return the right object
  console.log("🔍 Threshold Check:", {
    bestSimilarity: bestMatch.similarity,
    threshold: threshold,
    comparison: `${bestMatch.similarity} >= ${threshold}`,
    result: bestMatch.similarity >= threshold
  });
  
  const passesThreshold = bestMatch.similarity >= threshold;
  
  const result = {
    found: passesThreshold,
    index: passesThreshold ? bestMatch.index : -1,
    name: passesThreshold ? bestMatch.name : undefined,
    id: passesThreshold ? bestMatch.id : undefined,
    similarity: (bestMatch.similarity * 100).toFixed(2) + "%",
    cosineSimilarity: (bestMatch.cosineSim * 100).toFixed(2) + "%",
    euclideanDistance: bestMatch.euclideanDist.toFixed(4),
    combinedScore: bestMatch.similarity.toFixed(4),
    numSamples: bestMatch.numSamples,
    passesThreshold,
    rawSimilarity: bestMatch.similarity, // ✅ Add raw value for easy comparison
  };

  console.log("✅ Face Matching Analysis:", {
    bestMatch: result,
    threshold: threshold,
    passed: passesThreshold ? "YES ✓" : "NO ✗",
    topMatches: allResults.slice(0, 3).map(r => ({
      name: r.name,
      similarity: (r.similarity * 100).toFixed(2) + "%",
      cosine: (r.cosineSim * 100).toFixed(2) + "%",
      passesThreshold: r.similarity >= threshold,
    })),
  });

  // ✅ FIX: Return the correct result object
  return result;
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
  const [capturingSamples, setCapturingSamples] = useState(false);
  const [samplesCollected, setSamplesCollected] = useState(0);
  const [faceDetected, setFaceDetected] = useState(null);
  const { userData, getUser, signRegister } = useDatabase();
  const user = useSelector((state) => state.User.value);
  const faces = userData?.user_faces || [];
  const [ready, setReady] = useState(false);

  // Load Human library dynamically
  useEffect(() => {
    const loadHuman = async () => {
      if (typeof window === "undefined" || Human) return;

      try {
        const HumanModule = await import("@vladmandic/human");
        Human = HumanModule.default || HumanModule.Human;
        console.log("Human loaded");
        setReady(true);
      } catch (err) {
        console.error("Failed to load Human", err);
      }
    };

    loadHuman();
  }, []);

  // Initialize Human
  const loadModels = async () => {
    if (modelsLoaded && humanInstance) return true;
    if (!Human) {
      setLoadingStatus("Loading face recognition library...");
      return false;
    }

    setLoadingStatus("Loading AI models...");

    try {
      humanInstance = new Human(humanConfig);
      await humanInstance.load();
      await humanInstance.warmup();

      setModelsLoaded(true);
      setLoadingStatus("Models loaded successfully!");
      console.log("Human library initialized:", humanInstance.version);
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
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000);
        });
      }
    } catch (error) {
      console.error("Error starting webcam:", error);
      setLoadingStatus("Error: Camera access denied");
      throw error;
    }
  };

  // Draw face guide overlay
  const drawFaceGuide = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const width = canvas.width * 0.5;
    const height = canvas.height * 0.65;

    // Draw oval guide
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, 2 * Math.PI);

    // Determine color based on face detection and validation status
    let strokeColor = "rgba(255, 255, 255, 0.5)";
    let lineWidth = 3;

    if (faceDetected) {
      const checksCount = Object.values(recognitionStatus).filter(
        (s) => s.status === true
      ).length;
      const totalChecks = 8;
      const progress = checksCount / totalChecks;

      if (progress < 0.3) {
        strokeColor = "rgba(255, 100, 100, 0.8)"; // Red - not aligned
      } else if (progress < 0.7) {
        strokeColor = "rgba(255, 200, 50, 0.8)"; // Yellow - getting there
      } else {
        strokeColor = "rgba(50, 255, 100, 0.8)"; // Green - good
        lineWidth = 4;
      }
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Draw corner markers
    const markerLength = 20;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(centerX - width / 2, centerY - height / 2 + markerLength);
    ctx.lineTo(centerX - width / 2, centerY - height / 2);
    ctx.lineTo(centerX - width / 2 + markerLength, centerY - height / 2);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(centerX + width / 2 - markerLength, centerY - height / 2);
    ctx.lineTo(centerX + width / 2, centerY - height / 2);
    ctx.lineTo(centerX + width / 2, centerY - height / 2 + markerLength);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(centerX - width / 2, centerY + height / 2 - markerLength);
    ctx.lineTo(centerX - width / 2, centerY + height / 2);
    ctx.lineTo(centerX - width / 2 + markerLength, centerY + height / 2);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(centerX + width / 2 - markerLength, centerY + height / 2);
    ctx.lineTo(centerX + width / 2, centerY + height / 2);
    ctx.lineTo(centerX + width / 2, centerY + height / 2 - markerLength);
    ctx.stroke();
  };

  // Detect and draw video frame
  const detectAndDrawVideo = async () => {
    if (
      !videoRef.current ||
      videoRef.current.paused ||
      videoRef.current.ended ||
      !humanInstance
    ) {
      return;
    }

    try {
      const result = await humanInstance.detect(videoRef.current);

      // Update face detection status
      if (result.face && result.face.length > 0) {
        setFaceDetected(result.face[0]);
      } else {
        setFaceDetected(null);
      }

      // Draw face guide overlay
      drawFaceGuide();

      const timeNow = Date.now();
      recognitionStatus.detectFPS.val = Math.round(
        1000 / (timeNow - detected.detect)
      );
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
      setLoadingStatus(
        `Capturing sample ${i + 1}/${
          recognitionSettings.requireMultipleSamples
        }...`
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = await humanInstance.detect(videoRef.current);

      if (result.face && result.face.length > 0 && result.face[0].embedding) {
        currentFace.samples.push(Array.from(result.face[0].embedding));
        setSamplesCollected(i + 1);
      } else {
        i--;
        setLoadingStatus(
          `Sample failed, retrying ${i + 1}/${
            recognitionSettings.requireMultipleSamples
          }...`
        );
      }
    }

    setCapturingSamples(false);
    setLoadingStatus(
      `${recognitionSettings.requireMultipleSamples} samples captured!`
    );
    return currentFace.samples;
  };

  // Validate Face
  const validationLoop = async () => {
    if (!videoRef.current || videoRef.current.paused || !humanInstance) {
      return null;
    }

    try {
      setLoadingStatus("Detecting face...");

      const result = await humanInstance.detect(videoRef.current);

      const timeNow = Date.now();
      recognitionStatus.drawFPS.val = Math.round(
        1000 / (timeNow - detected.draw)
      );
      detected.draw = timeNow;

      recognitionStatus.faceCount.val = result.face?.length || 0;
      recognitionStatus.faceCount.status =
        recognitionStatus.faceCount.val === 1;

      if (recognitionStatus.faceCount.status && result.face[0]) {
        const face = result.face[0];

        const gestures = result.gesture?.map((g) => g.gesture) || [];
        recognitionStatus.facingCenter.status =
          gestures.includes("facing center");
        recognitionStatus.lookingCenter.status =
          gestures.includes("looking center");

        recognitionStatus.faceConfidence.val =
          face.faceScore || face.boxScore || 0;
        recognitionStatus.faceConfidence.status =
          recognitionStatus.faceConfidence.val >=
          recognitionSettings.minConfidence;

        recognitionStatus.faceSize.val = Math.min(face.box[2], face.box[3]);
        recognitionStatus.faceSize.status =
          recognitionStatus.faceSize.val >= recognitionSettings.minSize;

        recognitionStatus.antispoofCheck.val = face.real || 0;
        recognitionStatus.antispoofCheck.status =
          recognitionStatus.antispoofCheck.val >=
          recognitionSettings.antispoofThreshold;

        recognitionStatus.livenessCheck.val = face.live || 0;
        recognitionStatus.livenessCheck.status =
          recognitionStatus.livenessCheck.val >=
          recognitionSettings.livenessThreshold;

        recognitionStatus.distance.val = face.distance || 0;
        recognitionStatus.distance.status =
          recognitionStatus.distance.val >= recognitionSettings.distanceMin &&
          recognitionStatus.distance.val <= recognitionSettings.distanceMax;

        recognitionStatus.descriptor.val = face.embedding?.length || 0;
        recognitionStatus.descriptor.status =
          recognitionStatus.descriptor.val > 0;


        const passedChecks = Object.values(recognitionStatus).filter(
          (s) => s.status === true
        ).length;
        setLoadingStatus(`Validating... (${passedChecks}/8 checks)`);
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

  // Detect Faces and Match - FIXED VERSION
  const detectFaces = async () => {
    if (!currentFace?.face?.embedding) {
      console.error("No face descriptor available");
      setLoadingStatus("Error: No face descriptor");
      return false;
    }

    setLoadingStatus("Matching face...");

    const descriptorArray = Array.from(currentFace.face.embedding);
    const res = findBestMatch(
      descriptorArray,
      faces,
      recognitionSettings.threshold // 0.75
    );

    console.log("🎯 Match Result:", {
      found: res.found,
      passesThreshold: res.passesThreshold,
      similarity: res.similarity,
      rawSimilarity: res.rawSimilarity,
      threshold: recognitionSettings.threshold,
      matchedName: res.name,
      matchedId: res.id,
      currentUserId: user?.code,
    });

    // ✅ FIX: Check passesThreshold instead of just index
    if (!res.found || !res.passesThreshold) {
      console.log("❌ No valid match found (below threshold)");
      
      // Check if this user has never registered
      const userExists = faces.find((elem) => elem.id === user?.code);
      
      if (!userExists) {
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
      } else {
        // User exists but face doesn't match - may need re-registration
        setOutcome({
          type: "Error",
          name: "Face not recognized.",
        });
        setLoadingStatus("Face not recognized");
        return false;
      }
    }

    // ✅ At this point, we have a valid match above threshold
    currentFace.record = faces[res.index];

    // Check if matched person is the logged-in user
    if (currentFace.record.id === user?.code) {
      if (okContainerRef.current) {
        okContainerRef.current.style.display = "none";
      }
      if (userData?.attendance && userData.attendance[getCurrentDayOfWeek()]) {
        signRegister(userData.attendance[getCurrentDayOfWeek()], "signout");
      }
      setOutcome({ 
        type: "Success", 
        name: currentFace.record.name,
        similarity: res.similarity
      });
      setLoadingStatus("Success!");
      return true;
    }

    // Matched someone else
    if (currentFace.record.id !== user?.code) {
      setOutcome({
        type: "Fail",
        name: `${currentFace.record.name}`,
      });
      if (okContainerRef.current) {
        okContainerRef.current.style.display = "none";
      }
      setLoadingStatus("Face mismatch - wrong person detected");
      return false;
    }

    // Should never reach here
    console.error("⚠️ Unexpected state in detectFaces");
    return false;
  };

  // Save Face Record
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

    // ✅ Convert descriptors into an object Firestore accepts
    const descriptorObject = samples.reduce((acc, desc, index) => {
      acc[`d${index}`] = Array.from(desc); // ✅ convert Float32Array → normal array
      return acc;
    }, {});

    const rec = {
      id: user?.code,
      name: `${user?.first_name} ${user?.last_name}`,
      descriptors: descriptorObject,          // ✅ object of arrays
      descriptor: Array.from(samples[0]),     // ✅ convert single descriptor too
      initial: user?.initial,
      registeredAt: new Date().toISOString(),
      numSamples: samples.length,
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

      setLoadingStatus("Face registered");
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
    if (!mediaStream && !isProcessing && Human) {
      mainFunc();
    }
  }, [Human, mediaStream, isProcessing]);

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
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              fontSize: "12px",
              zIndex: 10,
              maxWidth: "300px",
            }}
          >
            {loadingStatus}
            {capturingSamples && (
              <div style={{ marginTop: "5px", fontSize: "10px" }}>
                Samples: {samplesCollected}/
                {recognitionSettings.requireMultipleSamples}
              </div>
            )}
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
            Position face in center of frame
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
            Keep a neutral expression
          </p>
        </div>
        <div onClick={mainFunc} ref={retryButtonRef} className={styles.retry}>
          RETRY
        </div>
      </div>
    </div>
  );
}