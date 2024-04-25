"use client"
import React, { useEffect, useState } from 'react'
import styles from '@/components/CSS/QR.module.css'

import { useDatabase } from '@/lib/context'
import QrScanner from 'qr-scanner'


export default function QR(checkQR) {
    const [display, setDisplay] = useState("none")
    const [support, setSupport] = useState("Checking..")
    const {signRegister, setErr, err} = useDatabase()

    useEffect(() => {
      if(navigator in window){
        navigator.mediaDevices.getUserMedia({ video: true })
      }
     if(document){
      const scanner = new QrScanner(document.getElementById("qr-video"), result => signRegister(result.data), {
        onDecodeError: error => {
          setSupport("Video not supported, Enter code.");
          setErr("");
        },
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: "environment",
        
    });
    scanner.start()
     }

    }, [])
    useEffect(() => {
      
      setErr("")
      if(window){
        window.addEventListener("click", () => {
          setErr("")
        })
      }
    },[])
    useEffect(() => {
      if(err !== ""){
        setDisplay("flex")
      }
      else setDisplay('none')
    }, [err])




  return (
    <div className={styles.Code}>
      <div  className={styles.try}>
        <video id='qr-video' className={styles.Video} disablePictureInPicture></video>
      </div>
  
        <span className={styles.scanner} style={{  display: display}}>{err}</span>
      <p style={{position: 'absolute', zIndex: -3}}>{support}</p>
    </div>
  )
}
