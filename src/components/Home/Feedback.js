"use client"
import React, { useEffect, useState } from 'react';
import styles from '@/components/CSS/Feedback.module.css';
var voucher_codes = require('voucher-code-generator');
import { Rating } from 'react-simple-star-rating'
import { useDatabase } from '@/lib/context';
import { PopUp } from './Modal';
const tooltip = [
    "Terrible",
    "Terrible+",
    "Bad",
    "Bad+",
    "Average",
    "Average+",
    "Great",
    "Great+",
    "Awesome",
    "Awesome+"
  ];
export default function Feedback() {
    const [message, setMessage] = useState("");
    const [stars, setStars] = useState(0)
    const [display, setDisplay] = useState("none")
    const [loading, setLoading] = useState(false)
    const {err, setErr} = useDatabase()
    const handleRating = (rate) => {
        setErr("")
        setDisplay("none")
        setStars(rate)
      }  
      const code = voucher_codes.generate({
            length: 12,
            count: 1
        })[0];
        
    const sendFeedback = async () => {
      
        if(stars > 0) {
            setLoading(true)
           await fetch("/api/send-feedback", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    feedback: {
                        id: code,
                        message,
                        star_count: stars
                    },
                    id: code
                })
            }).then(() => {
                    setDisplay("flex")
                    setErr("Thank you for the feedback!")
                 let time = setTimeout(() => {
                    setErr("")
                    setDisplay("none")
                 },5000)
                setMessage("")
                setStars(0)
                setLoading(false)
                return time;
            })
        }
        else {
            setDisplay("flex")
            setErr("Please provide feedback")
        }
       
    }
  return (
    <div className={styles.Code}>
        <Rating
        onClick={handleRating}
        initialValue={stars}
        allowFraction
        fillColor={"#03a4ff"}
        showTooltip
        tooltipStyle={{width: "90px", background: "#03a4ff", textAlign: "center", fontSize: "min(12px, 2vw)", borderRadius: "5px"}}
        tooltipArray={tooltip}
        tooltipDefaultText='Your Rating'
      />
        <textarea type="text" value={message} placeholder='Tell us what you think about our app' onChange={(e) => {
            setMessage(e.target.value)
        }}/>
        <p>Feedback is anonymous.</p>
        <p>We take all responses with utmost importance.</p>

        <div className={styles.btn} onClick={sendFeedback}>
            {loading ? "Sending..." : "Send Feedback"}
        </div>
        <PopUp onclick={() => setDisplay("none")} display={display} err={err}/>
    </div>
  )
}


