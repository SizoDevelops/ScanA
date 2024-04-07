"use client"
import React, { useEffect, useState } from 'react'
import styles from '@/components/CSS/Code.module.css'

import { useDatabase } from '@/lib/context'

export default function Movement() {
  const [code, setCode] = useState("")
  const [reason, setReason] = useState("")
  const [display, setDisplay] = useState("none")
  const {signMovement, err, setErr, loading} = useDatabase()


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
    else if(err === "Successfully Signed!"){
        setCode("")
        setReason("")
    }
    else setDisplay('none')
  }, [err])

  return (
    <div className={styles.Code}>
        
        <input type="text" placeholder={"WDRET"} value={code} onChange={e => setCode(e.target.value.toUpperCase().replace("SCNA-", ""))} />
        <input type="text" placeholder={"Enter movement reason"} value={reason} onChange={e => setReason(e.target.value)} />
        <div className={styles.btn} onClick={() => signMovement("SCNA-" + code, reason)}>
           {loading ? "Signing..." : "Sign"}
        </div>
        <p>Enter the 5 letters after the dash (-)</p>
        <p>This is for movement, not attendance.</p>
        <p>Ask your admin for movement codes.</p>
        <span className={styles.scanner} style={{  display: display}}>{err}</span>
       
    </div>
  )
}
