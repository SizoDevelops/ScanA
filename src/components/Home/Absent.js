"use client"
import React, { useEffect, useState } from 'react'
import styles from "../CSS/Absent.module.css"
import { useDatabase } from '@/lib/context'
import { updateAttendance } from '@/lib/Slice'
import { useDispatch } from 'react-redux'
import { PopUp } from './Modal'
export default function Absent() { 
    const {err, setErr, markAbsent,   absentLoading, getCurrentWeek} = useDatabase()
    const [reason, setReason] = useState("")
    const [display, setDisplay] = useState("none")
   
    const [daysAbsent, setAbsent] = useState([])
    const dispatch = useDispatch()

  

    useEffect(() => {
     
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
                <label className={styles.container}>
                        <input type="checkbox" name="monday" onChange={e => {
                            if(e.target.checked && !daysAbsent.find(item => item === "monday")){
                                    setAbsent(prep => [...prep, "monday"])
                            }
                            else{
                                setAbsent(daysAbsent.filter(item => item !== "monday"))
                            }
                        }} checked={daysAbsent.includes("monday")} />
                        <span className={styles.checkmark}></span>
                        <p>Mon</p>
                    </label>
                    <label className={styles.container}>
                        <input type="checkbox" name="tuesday" onChange={e => {
                            if(e.target.checked && !daysAbsent.find(item => item === "tuesday")){
                                    setAbsent(prep => [...prep, "tuesday"])
                            }
                            else{
                                setAbsent(daysAbsent.filter(item => item !== "tuesday"))
                            }
                        }} checked={daysAbsent.includes("tuesday")} />
                        <span className={styles.checkmark}></span>
                        <p>Tue</p>
                    </label>
                    <label className={styles.container}>
                        <input type="checkbox" name="wednesday" onChange={e => {
                            if(e.target.checked && !daysAbsent.find(item => item === "wednesday")){
                                    setAbsent(prep => [...prep, "wednesday"])
                            }
                            else{
                                setAbsent(daysAbsent.filter(item => item !== "wednesday"))
                            }
                        }} checked={daysAbsent.includes("wednesday")} />
                        <span className={styles.checkmark}></span>
                        <p>Wed</p>
                    </label>
                    <label className={styles.container}>
                        <input type="checkbox" name="thursday" onChange={e => {
                            if(e.target.checked && !daysAbsent.find(item => item === "thursday")){
                                    setAbsent(prep => [...prep, "thursday"])
                            }
                            else{
                                setAbsent(daysAbsent.filter(item => item !== "thursday"))
                            }
                        }} checked={daysAbsent.includes("thursday")} />
                        <span className={styles.checkmark}></span>
                        <p>Thu</p>
                    </label>
                    <label className={styles.container}>
                        <input type="checkbox" name="friday" onChange={e => {
                            if(e.target.checked && !daysAbsent.find(item => item === "friday")){
                                    setAbsent(prep => [...prep, "friday"])
                            }
                            else{
                                setAbsent(daysAbsent.filter(item => item !== "friday"))
                            }
                        }} checked={daysAbsent.includes("friday")} />
                        <span className={styles.checkmark}></span>
                        <p>Fri</p>
                    </label>
                    
                </div>

                <p>Selected days only apply for this week which is week {getCurrentWeek()}</p>
                <p>Once submitted this action cannot be undone.</p>
                <p>If you mark as absent on a particular day, you will not be able to sign the register on that day.</p>

            {/* ......................................................................... */}
            <button type="submit" className={styles.submit} disabled={absentLoading ? true : false} onClick={() => {
               
            }}>{ absentLoading ? "Sending..." : "Send Request"}</button>
            
            <PopUp display={display} err={err} onclick={() => setErr("")} />
        </form>
      )
}
