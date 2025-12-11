"use client"

import React, { useEffect, useState } from 'react'
import styles from '../../components/CSS/Login.module.css'
import { signIn, useSession } from 'next-auth/react';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { useDatabase } from '@/lib/context';
import { Suspense } from "react";
import Loader from '@/components/Home/Loader';


export default function Page() {
  // useEffect(() => {
  //     const hasTouch =
  //       "maxTouchPoints" in navigator && navigator.maxTouchPoints > 0;
  //     const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(
  //       navigator.userAgent
  //     );
  
  //     if ((!hasTouch, !isMobileUA)) {
  //       window.location.href = "https://dashboard.scana.co.za"
  //     }
  //   }, []);
  return (
    <Suspense fallback={<Loader/>}>
      <Login />
    </Suspense>
  )
}


const Login = () => {
  const searchParams = useSearchParams()
  const { err, setErr} = useDatabase()
  const [submitting, setSubmitting] = useState(false)
  const schoolCode = searchParams.get("code")
  const userCode = searchParams.get('usercode')
  const [display, setDisplay] = useState("none")
  const [school_code, setSchooCode] = useState(schoolCode ? schoolCode : "")
  const [code, setCode] = useState(userCode ? userCode : "")
  const [password, setPassword] = useState("")
  const router = useRouter()
  

  const {data: session} = useSession()

  useEffect(() => {
    const hasTouch = "maxTouchPoints" in navigator && navigator.maxTouchPoints > 0;
  
    // if(!hasTouch){
    //   redirect("https://dashboard.scana.co.za")
    // }
  }, [])

  useEffect(() => {
    if(session && session?.user){
      router.push("/")
    }
  },[session])



  useEffect(() => {
    if(err !== ""){
      setDisplay("flex")
    }
    else setDisplay('none')
  }, [err])


  useEffect(() => {
    setErr("")
    if(window){
      window.addEventListener("click", () => {
        setErr("")
      })
    }
  },[])

  const submitForm = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try{
      await signIn("credentials", {
      school_code: school_code?.trim(),
      code: code?.trim(),
      password: password,
      redirect: false
    }).then(err => {
      
      if(err.error){
        setSubmitting(false)
        setErr("Invalid Credentials");
      }
      
     })
    }
    catch(error){
      setSubmitting(false)
      throw new Error(error)
    }
    
  }
  return (
    <div className={styles.Main}>
          <form className={styles.container} onSubmit={submitForm}>
            <label htmlFor='Company Code'>Company Code</label>
            <input type='text' name="Company Code" required value={school_code} onChange={(e) => setSchooCode(e.target.value)}/>
           
            <label htmlFor='Code'>Enter Your Code</label>
            <input type="text" name="Code" value={code} required onChange={(e) => setCode(e.target.value)}/>
            <label htmlFor='Password'>Password</label>
               <input type="password" name="Password" value={password} required onChange={e => setPassword(e.target.value)}/>
           

            <button type='submit' className={styles.submit}>{submitting ? "Checking..." : "Login"}</button>
          </form>
 <span className={styles.scanner} style={{  display: display}}>{err}</span>

<p>Check your email for credentials.</p>
<p>Do not lose or share them with anyone.</p>
<p>Contact your admin if you forgot your password.</p>
    </div>
  )
};