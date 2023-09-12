import Dashboard from '@/components/Home/Dashboard'
import React from 'react'
import styles from "@/app/page.module.css"

export default function Page() {
  return (
    <div className={styles.main}>
      <Dashboard/>
    </div>
  )
}
