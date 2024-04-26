"use client"
import React, { useEffect, useState } from 'react'
import styles from '../CSS/Menu.module.css'
import { useDatabase } from '@/lib/context'
import { useSelector } from 'react-redux'
import { signOut } from 'next-auth/react'


export default function Menu() {
    const {screens, setScreens, userData} = useDatabase()
    const userDa = useSelector(state => state.User.value)
    const [meetings, setMeetings] = useState([])
    useEffect(() => {
        setMeetings([])
      
        setMeetings(userData?.school_meetings.filter(items => {
          return (items.participants.some(item => userDa.position.includes(item)) && items.date > Date.now())
        }))
    }, [userData])
  return (
    <div className={styles.Menu}>
        <div className={styles.MenuBtns}>
        <div className={styles.btn} onClick={() => {
                
                if(!screens.find(item => item === "Absent")){
                    setScreens(prep => [...prep, "Absent"])
                 }
                 else if(screens.includes("Absent")){
                     
                     setScreens([...screens.filter(item => item !== "Absent"), "Absent"])
                     
                 }
                 else {
                    return
                 }}}>
                <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
</svg>
                <p>Absent</p>
            </div>
           <div className={styles.btn} onClick={() => {
                
                if(!screens.find(item => item === "Meetings")){
                    setScreens(prep => [...prep, "Meetings"])
                 }
                 else if(screens[1] === "Meetings"){
                     
                     setScreens([...screens.slice(0, 1).concat(screens.slice(2)), "Meetings"])
                     
                 }
                 else {
                    return
                 }
            }}>
            <span className={styles.notify}>{meetings.length > 9 ? "9+" : meetings.length}</span>
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
  <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
</svg>
                <p>Meetings</p>
           </div>
           {/* <div className={styles.btn}>
           <span className={styles.notify}>9+</span>
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
  <path d="M4 4a3 3 0 0 0-3 3v6h6V7a3 3 0 0 0-3-3m0-1h8a4 4 0 0 1 4 4v6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a4 4 0 0 1 4-4m2.646 1A4 4 0 0 1 8 7v6h7V7a3 3 0 0 0-3-3z"/>
  <path d="M11.793 8.5H9v-1h5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.354-.146zM5 7c0 .552-.448 0-1 0s-1 .552-1 0a1 1 0 0 1 2 0"/>
</svg>
                <p>Posts</p>
           </div> */}

<div className={styles.btn} onClick={() => {
                
                if(!screens.find(item => item === "Feedback")){
                    setScreens(prep => [...prep, "Feedback"])
                 }
                 else if(screens.includes("Feedback")){
                     
                     setScreens([...screens.filter(item => item !== "Feedback"), "Feedback"])
                     
                 }
                 else {
                    return
                 }
            }}>
            <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
        <path d="M5.354 5.119 7.538.792A.52.52 0 0 1 8 .5c.183 0 .366.097.465.292l2.184 4.327 4.898.696A.54.54 0 0 1 16 6.32a.55.55 0 0 1-.17.445l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256a.5.5 0 0 1-.146.05c-.342.06-.668-.254-.6-.642l.83-4.73L.173 6.765a.55.55 0 0 1-.172-.403.6.6 0 0 1 .085-.302.51.51 0 0 1 .37-.245zM8 12.027a.5.5 0 0 1 .232.056l3.686 1.894-.694-3.957a.56.56 0 0 1 .162-.505l2.907-2.77-4.052-.576a.53.53 0 0 1-.393-.288L8.001 2.223 8 2.226z"/>
        </svg>
                <p>Feedback</p>
            </div>


           <div className={styles.btn} onClick={signOut}>

           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.496 21H6.5c-1.105 0-2-1.151-2-2.571V5.57c0-1.419.895-2.57 2-2.57h7M16 15.5l3.5-3.5L16 8.5m-6.5 3.496h10"/></svg>
                <p>Log Out</p>
           </div>
      
        </div>
    </div>
  )
}
