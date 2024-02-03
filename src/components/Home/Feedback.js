import React from 'react'
import styles from '@/components/CSS/Feedback.module.css'
export default function Feedback() {
  return (
    <div className={styles.Code}>
        <h2>How can we Improve?</h2>
        <textarea type="text" />
        <p>Any feedback is appreciated.</p>
        <p>Feedback is anonymous.</p>
        <p>We will get back to you or improve.</p>
    </div>
  )
}
