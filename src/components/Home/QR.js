"use client"
import React, { useEffect, useState } from 'react'
import styles from '@/components/CSS/QR.module.css'

import { useDatabase } from '@/lib/context'
import QrScanner from 'qr-scanner'
import { PopUp } from './Modal'


export default function QR(checkQR) {
    const [display, setDisplay] = useState("none")
    const [support, setSupport] = useState("Checking..")
    const {signRegister, setErr, err} = useDatabase()

    useEffect(() => {
      if(navigator in window){
        navigator.mediaDevices.getUserMedia({ video: true })
      }
     if(document){
      const scanner = new QrScanner(document.getElementById("qr-video"), result => {
        
        if (result.data.includes("SCNA-")){
          
          setSupport("Checking..")
          signRegister(result.data)
          
        }
        scanner.stop()
      }, {
        onDecodeError: error => {
          setSupport("Video not supported, Enter code.");
        
        },
        
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: "environment",
        maxScansPerSecond: 1
        
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
        document.getElementById("qr-video").pause()
        
      }
      else {
        setDisplay('none')
        document.getElementById("qr-video").play()
    }
    }, [err])




  return (
    <div className={styles.Code}>
      <div  className={styles.try}>
        <video id='qr-video' className={styles.Video}></video>
      </div>
  
        <PopUp display={display} err={err} onclick={() => setErr("")} />
      <p style={{position: 'absolute', zIndex: -3}}>{support}</p>
    </div>
  )
}
