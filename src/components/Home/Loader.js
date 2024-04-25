import React from 'react'
import styles from '../CSS/Loader.module.css'
import Logo from './Logo'

export default function Loader() {
  return (
    <div className={styles.contain}>
        <div className={styles.cont}>
            <span className={styles.scan1}></span>
            <Logo bgColor={"#0099F1"} widthV={381} heightV={120} width={220} height={130}/>
            <span className={styles.scan2}></span>
        </div>
        

    </div>
  )
}
