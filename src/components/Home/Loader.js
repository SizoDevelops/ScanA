import React from 'react'
import styles from '@/components/CSS/Loader.module.css'

export default function Loader() {
  return (
    <div className={styles.container}>
        <div className={styles.cont}>
            <span></span>
            <div className={styles.dashProfile} ></div>
        </div>
        

    </div>
  )
}
