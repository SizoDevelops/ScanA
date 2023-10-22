"use client"

import React, { useEffect, useState } from 'react'
import styles from '../../components/CSS/Login.module.css'
import { signIn, useSession } from 'next-auth/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';


export default function Page() {
  const searchParams = useSearchParams()
  const url = searchParams.get("callbackUrl")
  const parsedUrl = new URL(url)
  const newUrl = new URLSearchParams(parsedUrl.search)
  
  const schoolCode = newUrl.get('code')
  const userCode = newUrl.get('usercode')

  const [school_code, setSchooCode] = useState(schoolCode)
  const [code, setCode] = useState(userCode)
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
            <input type='text' name="Company Code" required value={school_code} onChange={(e) => setSchooCode(e.target.value)}/>
           
            <label htmlFor='Code'>Enter Your Code</label>
            <input type="text" name="Code" value={code} required onChange={(e) => setCode(e.target.value)}/>
            <label htmlFor='Password'>Password</label>
               <input type="password" name="Password" value={password} required onChange={e => setPassword(e.target.value)}/>
           

            <button type='submit' className={styles.submit}>Login</button>
          </form>


<p>Check your email for credentials.</p>
<p>Do not lose or share them with anyone.</p>
<p>Contact your admin if you forgot your password.</p>
    </div>
  )
}
