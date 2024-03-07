"use client";

import * as Human from "@/lib/face-id";
import * as indexDb from '@/lib/Human'
import React, { useEffect, useRef, useState } from "react";
import styles from "@/components/CSS/FaceRecognition.module.css";
// Face recognition configuration
const faceRecognitionConfig = {
  cacheSensitivity: 0,
  modelBasePath: "/models",
  filter: { enabled: true, equalization: true },
  debug: true,
  face: {
    enabled: true,
    detector: { rotation: true, return: true, mask: true },
    description: { enabled: true },
    iris: { enabled: true },
    emotion: { enabled: false },
    antispoof: { enabled: true },
    liveness: { enabled: true },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: true },
};
const recognitionThresholds = { order: 2, multiplier: 25, min: 0.2, max: 0.8 };

const recognitionSettings = {
  minConfidence: 0.6,
  minSize: 224,
  maxTime: 30000,
  blinkMin: 10,
  blinkMax: 800,
  threshold: 0.5,
  distanceMin: 0.2,
  distanceMax: 1,
  mask: faceRecognitionConfig.face.detector.mask,
  rotation: faceRecognitionConfig.face.detector.rotation,
  ...recognitionThresholds,
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
// Face recognition instance
const faceRecognition = new Human.Human(faceRecognitionConfig);

faceRecognition.env.perfadd = false;
faceRecognition.draw.options.font = 'small-caps 13px "Lato"';
faceRecognition.draw.options.lineHeight = 20;

// Current Identified Face
const currentFace = { face: null, record: null };
const blinking = {
  start: 0,
  time: 0,
  end: 0,
};

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

const detected = { detect: 0, draw: 0 };
let startTime = 0;

export default function FaceRecognition() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const matchRef = useRef(null);
  const nameInputRef = useRef(null);
  const saveButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);
  const retryButtonRef = useRef(null);
  const sourceCanvasRef = useRef(null);
  const okContainerRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  //  Camera Start
  const webCamStart = async () => {
    let videoConfig = {
      audio: false,
      video: {
        facingMode: "user",
        width: {
          min: 200,
          max: 400,
          
        },
        height: {
          ideal: 350,
        },
      },
    };

    const videoSrc = await navigator.mediaDevices.getUserMedia(videoConfig);
    setMediaStream(videoSrc);
    const isReady = new Promise((resolve) => {
      videoRef.current.onloadeddata = () => resolve(true);
    });
    videoRef.current.srcObject = videoSrc;
    await isReady;
    videoRef.current.play();
    canvasRef.current.width = videoRef.current.videoWidth - 30;
    canvasRef.current.height = videoRef.current.videoHeight - 30;
    canvasRef.current.style.width = videoRef.current.videoWidth - 30;
    canvasRef.current.style.height = videoRef.current.videoHeight -30;
    canvasRef.current.style.zIndex = 1
    canvasRef.current.onclick = () => {
      videoRef.current.paused
        ? videoRef.current.play()
        : videoRef.current.pause();
    };
  };

  // Detect Video
  const detectVideo = async () => {
    if (!videoRef.current.paused) {
      if (currentFace.face?.tensor) {
        faceRecognition.tf.dispose(currentFace.face.tensor);
      }
      await faceRecognition.detect(videoRef.current);
      const timeNow = faceRecognition.now();
      recognitionStatus.detectFPS.val =
        Math.round(10000 / (timeNow - detected.detect)) / 10;
      detected.detect = timeNow;
      requestAnimationFrame(detectVideo);
    }
  };
  function drawValidationTests() {
    let y = 32;
    for (const [key, val] of Object.entries(recognitionStatus)) {
      let el = document.getElementById(`ok-${key}`);
      if (!el) {
        el = document.createElement("div");
        el.id = `ok-${key}`;
        el.innerText = key;
        el.className = styles.Okay;
        okContainerRef.current.appendChild(el);
      }
      if (typeof val.status === "boolean")
        el.style.background = val.status ? "lightgreen" : "lightcoral";
      const status = val.status ? "ok" : "fail";
      el.innerText = `${key}: ${val.val === 0 ? status : val.val}`;
    }
  }

  // Validate Face and Video
  const validationLoop = async () => {
    // console.log(faceRecognition.result)
    const interpolated = faceRecognition.next(faceRecognition.result);

    faceRecognition.draw.canvas(videoRef.current, canvasRef.current);

    await faceRecognition.draw.all(canvasRef.current, interpolated);

    const timeNow = faceRecognition.now();
    recognitionStatus.drawFPS.val =
      Math.round(10000 / (timeNow - detected.draw)) / 10;
    detected.draw = timeNow;

    recognitionStatus.faceCount.val = faceRecognition.result.face?.length;
    recognitionStatus.faceCount.status = recognitionStatus.faceCount.val === 1;

    if (recognitionStatus.faceCount.status) {
      const gestures = Object.values(faceRecognition.result.gesture).map(
        (gesture) => gesture.gesture
      );

      // if (
      //   gestures.includes("blink left eye") ||
      //   gestures.includes("blink right eye")
      // ) {
      //   blinking.start = faceRecognition.now();
      // }
      // if (
      //   blinking.start > 0 &&
      //   !gestures.includes("blink left eye") &&
      //   !gestures.includes("blink right eye")
      // ) {
      //   blinking.end = faceRecognition.now();
      // }

      // recognitionStatus.blinkDetected.status =
      //   recognitionStatus.blinkDetected.status ||
      //   (Math.abs(blinking.end - blinking.start) >
      //     recognitionSettings.blinkMin &&
      //     Math.abs(blinking.end - blinking.start) <
      //       recognitionSettings.blinkMax);

      // if (recognitionStatus.blinkDetected.status && blinking.time === 0) {
      //   blinking.time = Math.trunc(blinking.end - blinking.start);
      // }
      recognitionStatus.facingCenter.status =
        gestures.includes("facing center");
      recognitionStatus.lookingCenter.status =
        gestures.includes("looking center");

      recognitionStatus.faceConfidence.val =
        faceRecognition.result.face[0].faceScore ||
        faceRecognition.result.face[0].boxScore ||
        0;

      recognitionStatus.faceConfidence.status =
        recognitionStatus.faceConfidence.val >=
        recognitionSettings.minConfidence;

      recognitionStatus.antispoofCheck.val =
        faceRecognition.result.face[0].real || 0;

      recognitionStatus.antispoofCheck.status =
        recognitionStatus.antispoofCheck.val >=
        recognitionSettings.minConfidence;

      recognitionStatus.livenessCheck.val =
        faceRecognition.result.face[0].live || 0;

      recognitionStatus.livenessCheck.status =
        recognitionStatus.livenessCheck.val >=
        recognitionSettings.minConfidence;

      recognitionStatus.faceSize.val = Math.min(
        faceRecognition.result.face[0].box[2],
        faceRecognition.result.face[0].box[3]
      );

      recognitionStatus.faceSize.status =
        recognitionStatus.faceSize.val >= recognitionSettings.minSize;

      recognitionStatus.distance.val =
        faceRecognition.result.face[0].distance || 0;
      recognitionStatus.distance.status =
        recognitionStatus.distance.val >= recognitionSettings.distanceMin &&
        recognitionStatus.distance.val <= recognitionSettings.distanceMax;

      recognitionStatus.descriptor.val =
        faceRecognition.result.face[0].embedding?.length || 0;
      recognitionStatus.descriptor.status =
        recognitionStatus.descriptor.val > 0;

      recognitionStatus.age.val = faceRecognition.result.face[0].age || 0;
      recognitionStatus.age.status = recognitionStatus.age.val > 0;
      recognitionStatus.gender.val =
        faceRecognition.result.face[0].genderScore || 0;
      recognitionStatus.gender.status =
        recognitionStatus.gender.val >= recognitionSettings.minConfidence;
    }
    //  Keep running
    recognitionStatus.timeout.status =
      recognitionStatus.elapsedMs.val <= recognitionSettings.maxTime;
    drawValidationTests();
    if (allOk() || !recognitionStatus.timeout.status) {
      videoRef.current.pause();
      return faceRecognition.result.face[0];
    }

    recognitionStatus.elapsedMs.val = Math.trunc(
      faceRecognition.now() - startTime
    );
    return new Promise((resolve) => {
      setTimeout(async () => {
        await validationLoop();
        resolve(faceRecognition.result.face[0]);
      }, 30);
    });
  };

  //  Detect Faces

  const detectFaces = async () => {
    canvasRef.current.getContext('2d')?.clearRect(0, 0, recognitionSettings.minSize, recognitionSettings.minSize);
    if (!currentFace?.face?.tensor || !currentFace?.face?.embedding) return false;

    console.log("face record", currentFace.face);

    console.log(
      `detected face: ${currentFace.face.gender} ${
        currentFace.face.age || 0
      }y distance ${100 * (currentFace.face.distance || 0)}cm/${Math.round(
        (100 * (currentFace.face.distance || 0)) / 2.54
      )}in`
    );

    await faceRecognition.tf.browser.draw(
      currentFace.face.tensor,
      canvasRef.current
    );
const db = await indexDb.load()
    if (await indexDb.count() === 0) {
      saveRecords()
      console.log("Nothing to compare with");
      return false;
    }
    const descriptors = db
      .map((rec) => rec.descriptor)
      .filter((desc) => desc.length > 0);

    const res = faceRecognition.match.find(
      currentFace.face.embedding,
      descriptors,
      recognitionThresholds
    );

    currentFace.record = db[res.index] || null;

    if (currentFace.record) {
      console.log(
        `best match: ${currentFace.record.name} | id: ${
          currentFace.record.id
        } | similarity: ${Math.round(1000 * res.similarity) / 10}%`
      );
      // sourceCanvasRef.current.style.display = '';
      // sourceCanvasRef.current.getContext('2d')?.putImageData(currentFace.record.image, 0, 0);
    }
    return res.similarity > recognitionSettings.threshold;
  };

  // Save Faces to DB
  async function saveRecords() {

      const image = canvasRef.current.getContext('2d')?.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const rec = { id: 0, name: "Sizo's Face", descriptor: currentFace.face?.embedding, image };
      await indexDb.save(rec);
      console.log('saved face record:', rec.name, 'descriptor length:', currentFace.face?.embedding?.length);
      console.log('known face records:', await indexDb.count());
 
  }
// Delete Faces

async function deleteRecord() {
  if (currentFace.record && currentFace.record.id > 0) {
    await indexDb.remove(currentFace.record);
  }
}

// MainFunc 

const mainFunc = async () => {
  recognitionStatus.faceCount.status = false;
  recognitionStatus.faceConfidence.status = false;
  recognitionStatus.facingCenter.status = false;
  // recognitionStatus.blinkDetected.status = false;
  recognitionStatus.faceSize.status = false;
  recognitionStatus.antispoofCheck.status = false;
  recognitionStatus.livenessCheck.status = false;
  recognitionStatus.age.status = false;
  recognitionStatus.gender.status = false;
  recognitionStatus.elapsedMs.val = 0;
  retryButtonRef.current.style.display = "none"
  okContainerRef.current.style.display = "flex"
  await webCamStart();
  await detectVideo(); // start detection loop
  startTime = faceRecognition.now();
  currentFace.face = await validationLoop(); // start validation loop
  canvasRef.current.width = currentFace.face?.tensor?.shape[1] || recognitionSettings.minSize;
  canvasRef.current.height = currentFace.face?.tensor?.shape[0] || recognitionSettings.minSize;
  canvasRef.current.style.zIndex = 1
  canvasRef.current.style.width = '';

  if (!allOk()) { // is all criteria met?
    okContainerRef.current.style.display = "none"
    retryButtonRef.current.style.display = "block"

    console.log('did not find valid face');
    return false;
  }
  return detectFaces();
}
  // Effects
  const init = async() => {
      await faceRecognition.load();
      await faceRecognition.warmup();
      await mainFunc()
  }

  useEffect(() => {

    if (!mediaStream) {
      init()
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null); // Clear the reference
      }
    };
  }, [mediaStream]);

  return (
    <div className={styles.Code}>
      <div className={styles.cont}>
         <canvas id="canvas" ref={canvasRef} className={styles.over}></canvas>
       <video id="video" ref={videoRef} autoPlay playsInline></video>

        <div className={styles.cutout}></div>
      </div>
     <div className={styles.secondPart}>
    <div id="ok" ref={okContainerRef} className={styles.over1}>

    </div>
      <div onClick={mainFunc} ref={retryButtonRef}>RETRY</div>
     </div>

    </div>
  );
}
