"use client"

import { signIn, signOut, useSession } from 'next-auth/react'
import React from 'react'
import Dashboard from './Dashboard'
import Loader from './Loader'
import styles from "@/components/CSS/Home.module.css"
import Image from 'next/image'
import Logo from './Logo'
import Link from 'next/link'

export default function Home() {
  // Get User Session 
  const {data:session, status} = useSession()

  // Check if laoding
  if(status === "loading"){
    return <Loader/>
  }
  // Check if authenticated
  else if(status === "authenticated" || session){
    return <Dashboard/>
  }
else return (
    <div className={styles.cont}>
      <div className={styles.image}>
         <Image alt='ScanA Hero Image' src={"/images/headerImage.svg"} fill/>
      </div>
      <Logo bgColor={"#0099F1"} widthV={381} heightV={120} width={220} height={130}/>
      <p className={styles.bodyParagraph}><span>Seamless</span> and <span>Effortless</span> attendance tracking</p>
      <div className={styles.loginBtn} onClick={signIn}>
        Login
      </div>
      <p className={styles.CTAParagraph}>Are you a school administrator?</p>
      <Link href={"https://dashboard.scana.co.za/signup"}>Register Your School</Link>
    </div>
  )
}
