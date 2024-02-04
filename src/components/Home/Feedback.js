"use client"
import React, { useEffect, useState } from 'react';
import styles from '@/components/CSS/Feedback.module.css';
var voucher_codes = require('voucher-code-generator');
import { Rating } from 'react-simple-star-rating'
import { useDatabase } from '@/lib/context';
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
                    setErr("Thank you for your time!")
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
        <PopUp  display={display} err={err}/>
    </div>
  )
}


const PopUp = ({display, err}) => {

    return(
        <span onClick={() => setDisplay("none")} className={styles.scanner} style={{  display: display}}>
            <span className={styles.icon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff"  viewBox="0 0 16 16">
  <path fillRule="evenodd" d="m8 2.42-.717-.737c-1.13-1.161-3.243-.777-4.01.72-.35.685-.451 1.707.236 3.062C4.16 6.753 5.52 8.32 8 10.042c2.479-1.723 3.839-3.29 4.491-4.577.687-1.355.587-2.377.236-3.061-.767-1.498-2.88-1.882-4.01-.721zm-.49 8.5c-10.78-7.44-3-13.155.359-10.063q.068.062.132.129.065-.067.132-.129c3.36-3.092 11.137 2.624.357 10.063l.235.468a.25.25 0 1 1-.448.224l-.008-.017c.008.11.02.202.037.29.054.27.161.488.419 1.003.288.578.235 1.15.076 1.629-.157.469-.422.867-.588 1.115l-.004.007a.25.25 0 1 1-.416-.278c.168-.252.4-.6.533-1.003.133-.396.163-.824-.049-1.246l-.013-.028c-.24-.48-.38-.758-.448-1.102a3 3 0 0 1-.052-.45l-.04.08a.25.25 0 1 1-.447-.224l.235-.468ZM6.013 2.06c-.649-.18-1.483.083-1.85.798-.131.258-.245.689-.08 1.335.063.244.414.198.487-.043.21-.697.627-1.447 1.359-1.692.217-.073.304-.337.084-.398"/>
</svg>
            </span>
            <i>{err}</i><p>Click to close</p></span>
    )
}