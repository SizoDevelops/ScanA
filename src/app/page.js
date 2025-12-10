"use client";
import Dashboard from "@/components/Home/Dashboard";
import React, { useEffect } from "react";
import styles from "@/app/page.module.css";
import Home from "@/components/Home/Home";


export default function Page() {
  
  useEffect(() => {
    const hasTouch =
      "maxTouchPoints" in navigator && navigator.maxTouchPoints > 0;
    const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

    if ((!hasTouch, !isMobileUA)) {
      window.location.href = "https://dashboard.scana.co.za"
    }
  }, []);

  return (
    <div className={styles.main}>
      <Home />
    </div>
  );
}
