"use client"
import React, { useEffect, useState } from 'react'
import styles from "../CSS/Absent.module.css"
import { useDatabase } from '@/lib/context'
export default function Absent() {
    const {err, setErr, markAbsent,  getCurrentDayOfWeek, getCurrentWeek} = useDatabase()
    const [reason, setReason] = useState("")
    const [display, setDisplay] = useState("none")
    const [daysArray, setDays] = useState(["monday", "tuesday", "wednesday", "thurday", "friday"])
    const [daysAbsent, setAbsent] = useState([])


  

    useEffect(() => {
     
        setDays(["monday", "tuesday", "wednesday", "thurday", "friday"])
        if(err !== ""){
          setDisplay("flex")
        }
        else setDisplay('none')
      }, [err])

      useEffect(() => {
        setAbsent([])
        setErr("")
        if(window){
          window.addEventListener("click", () => {
            setErr("")
          })
        }

        if(getCurrentDayOfWeek() == "monday") {
           setDays(["monday", "tuesday", "wednesday", "thurday", "friday"])

        }
        else if(getCurrentDayOfWeek() == "tuesday") {
            setDays(["tuesday", "wednesday", "thurday", "friday"])

        }
        else if(getCurrentDayOfWeek() == "wednesday") {
            setDays(["wednesday", "thurday", "friday"])

        }
        else if(getCurrentDayOfWeek() == "thursday") {
            setDays(["thurday", "friday"])

        }
         else if(getCurrentDayOfWeek() == "friday") {
            setDays(["friday"])

        }

      },[])

    return (
        <form className={styles.Code} onSubmit={(e) => {
            e.preventDefault()
            if(reason.length < 3){
                setErr("Enter a valid Reason")
            }
            else if (daysAbsent.length === 0) {
                setErr("Select at least one day.")
            }
            else {
                markAbsent(reason.toUpperCase(), daysAbsent)
            }
        }}>
            
            
            <input type="text" placeholder={"Enter Reason"} value={reason} onChange={e => setReason(e.target.value)} maxLength={15}/>
            <p>Enter the reason you are absent e.g(Sick, Workshop, Leave, etc.)</p>
            <p>The reason can only be 15 characters long (appr. two words).</p>
           

            {/* .................................... */}
               
                <div className={styles.days}>
                    <label>
                        <input type="checkbox" name="monday" onChange={e => {
                            if(e.target.checked && !daysAbsent.find(item => item === "monday")){
                                    setAbsent(prep => [...prep, "monday"])
                            }
                            else{
                                setAbsent(daysAbsent.filter(item => item !== "monday"))
                            }
                        }} disabled={!daysArray.find(elem => elem === "monday") ? true : false}/>
                        <p>Mon</p>
                    </label>
                    <label >
                        <input type="checkbox" name="tuesday" onChange={e => {
                            if(e.target.checked && !daysAbsent.find(item => item === "tuesday")){
                                    setAbsent(prep => [...prep, "tuesday"])
                            }
                            else{
                                setAbsent(daysAbsent.filter(item => item !== "tuesday"))
                            }
                        }}  disabled={!daysArray.find(elem => elem === "tuesday")  ? true : false}/>
                        <p>Tue</p>
                    </label>
                    <label>
                        <input type="checkbox" name="wednesday" onChange={e => {
                            if(e.target.checked && !daysAbsent.find(item => item === "wednesday")){
                                    setAbsent(prep => [...prep, "wednesday"])
                            }
                            else{
                                setAbsent(daysAbsent.filter(item => item !== "wednesday"))
                            }
                        }}  disabled={!daysArray.find(elem => elem === "wednesday")  ? true : false}/>
                        <p>Wed</p>
                    </label>
                    <label>
                        <input type="checkbox" name="thursday" onChange={e => {
                            if(e.target.checked && !daysAbsent.find(item => item === "thursday")){
                                    setAbsent(prep => [...prep, "thursday"])
                            }
                            else{
                                setAbsent(daysAbsent.filter(item => item !== "thursday"))
                            }
                        }}  disabled={!daysArray.find(elem => elem === "thurday")  ? true : false}/>
                        <p>Thu</p>
                    </label>
                    <label>
                        <input type="checkbox" name="friday" onChange={e => {
                            if(e.target.checked && !daysAbsent.find(item => item === "friday")){
                                    setAbsent(prep => [...prep, "friday"])
                            }
                            else{
                                setAbsent( daysAbsent.filter(item => item !== "friday"))
                            }
                        }}  disabled={!daysArray.find(elem => elem === "friday")  ? true : false}/>
                        <p>Fri</p>
                    </label>
                    
                </div>

                <p>Selected days only apply for this week which is week {getCurrentWeek()}</p>
                <p>Once submitted this action cannot be undone.</p>
                <p>If you mark as absent on a particular day, you will not be able to sign the register on that day.</p>

            {/* ......................................................................... */}
            <button type="submit" className={styles.submit} onClick={() => {
               
            }}>Send Request</button>
            <span className={styles.scanner} style={{  display: display }}>{err}</span>
        </form>
      )
}
