"use client"
import React, { useEffect, useState } from 'react'
import styles from '@/components/CSS/QR.module.css'
import { QrScanner } from '@yudiel/react-qr-scanner'
import { useDatabase } from '@/lib/context'
import { useRouter } from 'next/navigation'

export default function QR(checkQR) {
    const [display, setDisplay] = useState("block")
    const [support, setSupport] = useState("Checking..")
    const {signRegister} = useDatabase()
    const router = useRouter()

  return (
    <div className={styles.Code}>
            <QrScanner
          onDecode={(result) => {
            signRegister(result)
            alert("Scanned")
            router.refresh()
          }}


          onError={() => {
            setDisplay('none')
            setSupport("Not Supported, Enter Code Instead.")
        }}
      
          scanDelay={500}
          videoStyle={{
           
            position: "absolute",
            border: "2px solid #03a4ff",
            padding: "0"
          }}
          containerStyle={{
            borderRadius: "5px",
            display: display,
            zIndex: -1,
          }}
 
      />
      <p style={{position: 'absolute', zIndex: -3}}>{support}</p>
    </div>
  )
}
