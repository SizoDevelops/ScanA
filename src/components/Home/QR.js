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
            <QrScanner
          onDecode={(result) => {
            signRegister(result)

          }}


          onError={() => {
            setSupport("Not Supported, Enter Code Instead.")
            setErr("")
        }}
      
          scanDelay={100}
          videoStyle={{
           
            position: "absolute",
            border: "2px solid #03a4ff",
            padding: "0"
          }}
          containerStyle={{
            borderRadius: "5px",
          }}
 
      />



{/* <QrReader
          delay={100}
          style={{
            height: "100%",
            width: "min(300px, 90vw)",
            border: "2px solid #03a4ff",
            borderRadius: "5px",
          
            
          }}

          onError={(err) => {
            setSupport("Not Supported, Enter Code Instead.")
            setErr("")
            console.log(err)
          }}
          onScan={(result) => {
            signRegister(result)
     
          }}
          constraints={
            {
              video: true,
              facingMode: "environment"
            }
          }
          /> */}
        <span className={styles.scanner} style={{  display: display}}>{err}</span>
      <p style={{position: 'absolute', zIndex: -3}}>{support}</p>
    </div>
  )
}
