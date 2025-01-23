"use client";

import * as Human from "@/lib/face-id";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/components/CSS/FaceRecognition.module.css";
import { useDatabase } from "@/lib/context";
import { useSelector } from "react-redux";
import ErrorModal from "./ErrorModal";
import * as tf from "@tensorflow/tfjs";


tf.setBackend("webgl");


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
  threshold: 0.6,
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
function getCurrentDayOfWeek() {
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const currentDay = daysOfWeek[dayOfWeek];
  return currentDay;
  // return "saturday"
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

const detected = { detect: 0, draw: 0 };
let startTime = 0;

export default function FaceRecognition() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const matchRef = useRef(null);
  const [outcome, setOutcome] = useState({ type: "", name: "" });
  const saveButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);
  const retryButtonRef = useRef(null);
  const sourceCanvasRef = useRef(null);
  const okContainerRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const { userData, getUser, signRegister } = useDatabase();
  const user = useSelector((state) => state.User.value);
  const faces = userData?.user_faces || [];

  //  Camera Start
  const webCamStart = async () => {
    let videoConfig = {
      audio: false,
      video: {
        facingMode: "user",
        width: {
          min: 250,
          max: 400,
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
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    // canvasRef.current.style.width = videoRef.current.videoWidth - 30;
    // canvasRef.current.style.height = videoRef.current.videoHeight -30;
    canvasRef.current.style.zIndex = 1;
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
    // drawValidationTests();
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
    canvasRef.current
      .getContext("2d")
      ?.clearRect(
        0,
        0,
        recognitionSettings.minSize,
        recognitionSettings.minSize
      );
    if (!currentFace?.face?.tensor || !currentFace?.face?.embedding)
      return false;

    console.log("face record", currentFace.face);

    console.log(
      `detected face: ${currentFace.face.gender} ${
        currentFace.face.age || 0
      }y distance ${100 * (currentFace.face.distance || 0)}cm/${Math.round(
        (100 * (currentFace.face.distance || 0)) / 2.54
      )}in`
    );

    await faceRecognition.tf.browser.toPixels(
      currentFace.face.tensor,
      canvasRef.current
    );
    const db = faces;
    const descriptors = db
      .map((rec) => rec.descriptor)
      .filter((desc) => desc.length > 0);

    const res = faceRecognition.match.find(
      currentFace.face.embedding,
      descriptors,
      recognitionThresholds
    );
    currentFace.record = db[res.index] || null;

    console.log(currentFace);

    if (!currentFace.record && !db.find((elem) => elem.id === user.code) && res.similarity < recognitionSettings.threshold) {
      setOutcome({
        type: "New",
        name: `${user?.first_name} ${user?.last_name}`,
        apply: " ",
      });
      okContainerRef.current.style.display = "none";
      // retryButtonRef.current.style.display = "block"

    

      return false;
    } else if (currentFace.record && currentFace.record.id === user.code && res.similarity > recognitionSettings.threshold) {
      console.log(
        `best match: ${currentFace.record.name} | id: ${
          currentFace.record.id
        } | similarity: ${Math.round(1000 * res.similarity) / 10}%`
      );
      console.log(res);
      okContainerRef.current.style.display = "none";
      // retryButtonRef.current.style.display = "block"
      // sourceCanvasRef.current.style.display = '';
      // sourceCanvasRef.current.getContext('2d')?.putImageData(currentFace.record.image, 0, 0);

      await signRegister(userData.attendance[getCurrentDayOfWeek()]);
      setOutcome({ type: "Success", name: currentFace.record.name });

      return true;
    } else if(currentFace.record && currentFace.record.id !== user.code && res.similarity > recognitionSettings.threshold) {
      setOutcome({ type: "Fail", name: currentFace.record.name });
      console.log(
        "This is " +
          currentFace.record.name +
          `| similarity: ${Math.round(1000 * res.similarity) / 10}%`
      );
      okContainerRef.current.style.display = "none";
      return false;
    }
    else {
      setOutcome({ type: "Error", name: "Not Found" });
      return false;
    }
  };

  // Save Faces to DB
  async function saveRecords() {
    // const image = canvasRef.current
    //   .getContext("2d")
    //   ?.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const rec = {
      id: user?.code,
      name: `${user?.first_name} ${user?.last_name}`,
      descriptor: currentFace.face?.embedding,
      initial: user?.initial,
    };
    // Save Face to DB
    await fetch("/api/faces", {
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
    })
      .then((data) => data.json())
      .then(async (d) => {
        await getUser(userData.school_code);
      })
      .catch((e) => {
        console.log(e);
      });
 
  }
  // Delete Faces

  async function deleteRecord() {
    if (currentFace.record && currentFace.record.id > 0) {
      // await fetch("/api/faces", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     key: userData.school_code,
      //     faceRecord: rec,
      //     method: "delete"
      //   })
      // })
    }
  }

  // MainFunc

  const mainFunc = async () => {
    okContainerRef.current.style.display = "none";
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
    retryButtonRef.current.style.display = "none";
    okContainerRef.current.style.display = "flex";
    await webCamStart();
    await detectVideo(); // start detection loop
    startTime = faceRecognition.now();
    currentFace.face = await validationLoop(); // start validation loop
    canvasRef.current.width =
      currentFace.face?.tensor?.shape[1] || recognitionSettings.minSize;
    canvasRef.current.height =
      currentFace.face?.tensor?.shape[0] || recognitionSettings.minSize;
    canvasRef.current.style.zIndex = 1;
    canvasRef.current.style.width = "";

    if (!allOk()) {
      // is all criteria met?
      okContainerRef.current.style.display = "none";
      retryButtonRef.current.style.display = "block";

      console.log("did not find valid face");
      return false;
    }
    return detectFaces();
  };
  // Effects
  const init = async () => {
    await faceRecognition.load();
    await faceRecognition.warmup();
    await mainFunc();
  };

  useEffect(() => {
    if (!mediaStream) {
      init();
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null); // Clear the reference
        recognitionStatus.timeout.status = false;
      }
    };
  }, [mediaStream]);

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
        ></video>
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
            {" "}
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
            {" "}
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
