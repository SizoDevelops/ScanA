"use client"
import React, { useEffect, useState } from 'react'
import styles from '@/components/CSS/Code.module.css'
import { useSession } from 'next-auth/react'
import { useGeolocated } from 'react-geolocated'
import { useDatabase } from '@/lib/context'
import { useRouter } from 'next/navigation'
export default function Code() {
  const [code, setCode] = useState("")
  const [display, setDisplay] = useState("none")
  const {signRegister, err, setErr} = useDatabase()
  useEffect(() => {
    if(code.length >= 4){

        signRegister("SCNA-" + code)
      
      
      setCode("")
    }

  }, [code])

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
        
        <input type="text" placeholder={"R3DW"} value={code} onChange={e => setCode(e.target.value.toUpperCase().replace("SCNA-", ""))} />
        <p>Enter just the 4 letters after the dash(-)</p>
        <span className={styles.scanner} style={{  display: display}}>{err}</span>
    </div>
  )
}
