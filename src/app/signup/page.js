import React from 'react'
import styles from '../../components/CSS/Login.module.css'
import Link from 'next/link'

export default function Page() {
  return (
    <div className={styles.Main}>

          <form className={styles.container}>
            <label htmlFor='Name'>Company Code</label>
            <input />
            <label htmlFor='Name'>Enter Your Code</label>
            <input />
            <label htmlFor='Name'>Password</label>
            <input type="password"/>
            <label htmlFor='Name'>Confirm Password</label>
            <input type="password"/>
          </form>
          <p>Already have an account? <Link href={"/login"}>Login</Link></p>
    </div>
  )
}
