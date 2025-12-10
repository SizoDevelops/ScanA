"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/components/CSS/QR.module.css";
import { useDatabase } from "@/lib/context";
import QrScanner from "qr-scanner";
import { PopUp } from "./Modal";

export default function QR() {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  const [display, setDisplay] = useState("none");
  const [support, setSupport] = useState("Checking..");
  const { signRegister, setErr, err } = useDatabase();

  // Initialize scanner
  useEffect(() => {
    if (typeof window !== "undefined" && videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (result.data.includes("SCNA-")) {
            setSupport("Checking..");
            signRegister(result.data, "signin");
            scanner.stop();
          }
        },
        {
          onDecodeError: () => {
            setSupport("Video not supported, Enter code.");
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment",
          maxScansPerSecond: 1,
        }
      );

      scanner.start().catch((err) => {
        setSupport("Camera access denied or unavailable.");
        console.error(err);
      });

      scannerRef.current = scanner;

      return () => {
        scanner.stop();
        scanner.destroy();
      };
    }
  }, [signRegister]);

  // Reset error on click
  useEffect(() => {
    setErr("");
    const resetErr = () => setErr("");
    window.addEventListener("click", resetErr);
    return () => window.removeEventListener("click", resetErr);
  }, [setErr]);

  // Handle error display
  useEffect(() => {
    if (videoRef.current) {
      if (err !== "") {
        setDisplay("flex");
        videoRef.current.pause();
      } else {
        setDisplay("none");
        videoRef.current.play();
      }
    }
  }, [err]);

  return (
    <div className={styles.Code}>
      <div className={styles.try}>
        <video ref={videoRef} className={styles.Video}></video>
      </div>
      <PopUp display={display} err={err} onclick={() => setErr("")} />
      <p style={{ position: "absolute", zIndex: -3 }}>{support}</p>
    </div>
  );
}