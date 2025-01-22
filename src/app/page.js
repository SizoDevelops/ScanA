
"use client"
import Dashboard from '@/components/Home/Dashboard'
import React, { useEffect } from 'react'
import styles from "@/app/page.module.css"
import Home from '@/components/Home/Home'
import { redirect } from 'next/navigation'

export default function Page() {
  useEffect(() => {
    const hasTouch = "maxTouchPoints" in navigator && navigator.maxTouchPoints > 0;
  
    // if(!hasTouch){
    //   redirect("https://dashboard.scana.co.za")
    // }
  }, [])

  return (
    <div className={styles.main}>
      <Home/>
    </div>
  )
}
