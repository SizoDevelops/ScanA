"use client"

import React, { useEffect, useState } from 'react'
import styles from '../../components/CSS/Login.module.css'
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';


export default function Page() {
  const [school_code, setSchooCode] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const {data: session} = useSession()

  useEffect(() => {
    if(session && session?.user){
      router.push("/")
    }
    
  },[session])



  const submitForm = async (e) => {
    e.preventDefault()
    await signIn("credentials", {
      school_code,
      code,
      password,
      redirect: true,
      callbackUrl: "/"
    })
  }
  return (
    <div className={styles.Main}>
          <form className={styles.container} onSubmit={submitForm}>
            <label htmlFor='Company Code'>Company Code</label>
            <input type='text' name="Company Code" value={school_code} onChange={(e) => setSchooCode(e.target.value)}/>
           
            <label htmlFor='Code'>Enter Your Code</label>
            <input type="text" name="Code" value={code} onChange={(e) => setCode(e.target.value)}/>
            <label htmlFor='Password'>Password</label>
               <input type="password" name="Password" value={password} onChange={e => setPassword(e.target.value)}/>
           

            <button type='submit' className={styles.submit}>Login</button>
          </form>

<p>Check your email for credentials.</p>
<p>Do not lose or share them with anyone.</p>
<p>Contact your admin if you forgot your password.</p>
    </div>
  )
}
