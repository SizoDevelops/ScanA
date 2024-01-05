"use client"
import React, { useEffect, useState } from 'react'
import styles from '@/components/CSS/QR.module.css'
import { QrScanner } from '@yudiel/react-qr-scanner'
import { useDatabase } from '@/lib/context'


export default function QR(checkQR) {
    const [display, setDisplay] = useState("none")
    const [support, setSupport] = useState("Checking..")
    const {signRegister, setErr, err} = useDatabase()
    useEffect(() => {
      if(navigator in window){
        navigator.mediaDevices.getUserMedia({ video: true })
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
    <QrScanner
  onDecode={(result) => signRegister(result)}
  onError={(e) => {
    setSupport("Video not supported, Enter code.");
    setErr("");
  }}
  scanDelay={100}

  videoStyle={{
    top: "50%",
    left: "50%",
    position: "absolute",
    border: "2px solid #03a4ff",
    padding: "0",
    transform: "translate(-50%, -50%)",
    width: "100%", // Set fixed width for mobile browsers
    height: "300px", // Set fixed height for mobile browsers
  }}
  viewFinder={() => <div className={styles.finder}><span></span></div>}
  containerStyle={{
    borderRadius: "5px",
    width: "100%", // Set fixed width for mobile browsers
    height: "300px", // Set fixed height for mobile browsers
    aspectRatio: "unset,",
    position: "relative",
    
  }}
/>
      </div>
   



        <span className={styles.scanner} style={{  display: display}}>{err}</span>
      <p style={{position: 'absolute', zIndex: -3}}>{support}</p>
    </div>
  )
}
