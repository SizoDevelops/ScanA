"use client"
import React, { useEffect, useState } from 'react'
import styles from '@/components/CSS/Code.module.css'
import { useSession } from 'next-auth/react'
import { useGeolocated } from 'react-geolocated'
import { useDatabase } from '@/lib/context'
import { useRouter } from 'next/navigation'
export default function Code() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const {signRegister} = useDatabase()
  const router = useRouter()
  useEffect(() => {
    if(code.length >= 13){
      setLoading(true)
      signRegister(code)
      setCode("")
      router.refresh()
    }
    else{
      setLoading(false)
  
    }
  }, [code])
  return (
    <div className={styles.Code}>
        
        <input type="text" placeholder={"SCNA-ERAWFRER"} value={code} onChange={e => setCode( e.target.value)} disabled={loading}/>
        <p>Dashes will be automatically added.</p>
        <p>Enter just the six letters after the dash(-)</p>
    </div>
  )
}
