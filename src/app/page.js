import Dashboard from '@/components/Home/Dashboard'
import React from 'react'
import styles from "@/app/page.module.css"
import Home from '@/components/Home/Home'

export default function Page() {
  return (
    <div className={styles.main}>
      <Home/>
    </div>
  )
}
