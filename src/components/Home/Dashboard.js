"use client"

import React, { useEffect, useState }  from 'react'
import styles from "@/components/CSS/Dashboard.module.css"
import Calendar from './Calender'
import Code from './Code'
import QR from './QR'

import { getSession, signOut, useSession } from 'next-auth/react'
import { useDatabase } from '@/lib/context'
import Loader from './Loader'
import Absent from './Absent'
import Menu from './Menu'
import Meetings from './Meetings/Meetings'
import { useSelector } from 'react-redux'

export default function Dashboard() {
    const {screens, setScreens, getCurrentMilitaryTime, userData} = useDatabase()
    const {data:session} = useSession()
    const {loading, user} = useDatabase()
    const userDa = useSelector(state => state.User.value)
    const [meetings, setMeetings] = useState([])
    useEffect(() => {
        setMeetings([])
      try{
           setMeetings(userData?.school_meetings.filter(items => {
            return (items.participants.some(item => userDa.position.includes(item)) && items.date > Date.now())
        }))
      }catch(error){
        throw new Error("Incorrect Data Received")
      }
     
    }, [userData])

    

if(loading){
    return <Loader/>
}
else if (!session) {
    throw new Error('User is not authenticated. Please sign in.');
  }

 else return (
    <div className={styles.dashboardCont}>
        <header className={styles.header}>
            <p>Dashboard</p>
            <div className={styles.dashProfile} onClick={signOut}></div>
        </header>

        <div className={styles.greeting}>
            <h1>{getCurrentMilitaryTime().hours < 12 ? "GOOD MORNING" : getCurrentMilitaryTime().hours >= 12 && getCurrentMilitaryTime().hours < 18 ? "GOOD AFTERNOON" : "GOOD EVENING"}</h1>
            <p>{user?.title.toUpperCase()} {user?.initial.toUpperCase()} {user?.last_name.toUpperCase()}</p>
        </div>

        <div className={styles.calendarHolder}>
            {
                screens[screens.length - 1] === "Code" ? <>
                    <Code/>
                   
                </>
                : screens[screens.length - 1] === "QR" 
                ? <QR/>
                : screens[screens.length - 1] === "Absent"
                ? <Absent/>
                : screens[screens.length - 1] === "Menu" 
                ? <Menu/>
                : screens[screens.length - 1] === "Meetings" 
                ? <Meetings/>
                :
                <>
                     {/* <div className={styles.schoolLogo}></div> */}
            <div className={styles.calendar}>
                <Calendar/>
                
            </div>
                </>
            }
            {/* <div className={styles.schoolLogo}></div>
            <div className={styles.calendar}>
                <Calendar/>
                
            </div> */}
            {/* <QR/> */}
            {/* <Code/> */}
        </div>

        <div className={styles.contacts}>
            <div className={styles.holder}>
                <div className={styles.image} style={{backgroundImage:"url(https://i.ibb.co/Wgw6bLq/mingcute-phone-fill.png)"}}>
                {/* <Image src={phoneImage} fill alt="Image"/> */}
                </div>
                <p>{user?.phone_number || "Not Provided"}</p>
            </div>
            <div className={styles.holder}>
                <div className={styles.image} style={{backgroundImage:"url(https://i.ibb.co/C8gwzSp/mdi-email.png)"}}>
                {/* <Image src={emailImage} fill alt="Image"/> */}
                </div>
                <p>{user?.email}</p>
            </div>
        </div>



        <div className={styles.buttons}>
        <div className={styles.btn} onClick={() => {
                if(screens.length > 1){
                    screens.pop()
                    setScreens([...screens])
                }
                
               
            }} style={screens.length  > 1 ? {opacity: "1"} : {opacity: "0.2"}}>
                <div className={styles.icon} style={{backgroundImage:"url(https://i.ibb.co/wCsH3yk/pajamas-go-back.png)"}}>
                {/* <Image src={attendImage} fill alt="Image"/> */}
                </div>
                <p>Back</p>
            </div>
            <div className={styles.btn} onClick={() => {
                
                if(!screens.find(item => item === "Code")){
                    setScreens(prep => [...prep, "Code"])
                 }
                 else if(screens.includes("Code")){
                     
                     setScreens([...screens.filter(item => item !== "Code"), "Code"])
                     
                 }
                 else {
                    return
                 }
            }}>
          <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
  <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5M3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0z"/>
</svg>
                <p>Enter Code</p>
            </div>

            <div className={styles.btn} onClick={() => {
                  if(!screens.find(item => item === "QR")){
                    setScreens(prep => [...prep, "QR"])
                 }
                 else if(screens.includes("QR")){
                     
                     setScreens([...screens.filter(item => item !== "QR"), "QR"])
                     
                 }
                else {
                   return
                }
            }}>
               <svg className={styles.icon}xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
  <path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1-.5-.5M.5 12a.5.5 0 0 1 .5.5V15h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H15v-2.5a.5.5 0 0 1 .5-.5M4 4h1v1H4z"/>
  <path d="M7 2H2v5h5zM3 3h3v3H3zm2 8H4v1h1z"/>
  <path d="M7 9H2v5h5zm-4 1h3v3H3zm8-6h1v1h-1z"/>
  <path d="M9 2h5v5H9zm1 1v3h3V3zM8 8v2h1v1H8v1h2v-2h1v2h1v-1h2v-1h-3V8zm2 2H9V9h1zm4 2h-1v1h-2v1h3zm-4 2v-1H8v1z"/>
  <path d="M12 9h2V8h-2z"/>
</svg>
                <p>Scan QR</p>
             </div>
        </div>



        <div className={styles.buttons}>
         
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
                <p>Report Absent</p>
            </div>

            <div className={styles.btn} onClick={() => {
                
                if(!screens.find(item => item === "Menu")){
                    setScreens(prep => [...prep, "Menu"])
                 }
                 else if(screens.includes("Menu")){
                     
                     setScreens([...screens.filter(item => item !== "Menu"), "Menu"])
                     
                 }
                 else {
                    return
                 }}}>
                     <span className={styles.notify} style={meetings?.length > 0 ? {display: "block"} : {display: "none"} }></span>
                <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
  <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h2A1.5 1.5 0 0 1 5 1.5v2A1.5 1.5 0 0 1 3.5 5h-2A1.5 1.5 0 0 1 0 3.5zM1.5 1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5zM0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm1 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2zm14-1V8a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2zM2 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5"/>
</svg>
                <p>Menu</p>
            </div>
            <div className={styles.btn}>
            <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
        <path d="M5.354 5.119 7.538.792A.52.52 0 0 1 8 .5c.183 0 .366.097.465.292l2.184 4.327 4.898.696A.54.54 0 0 1 16 6.32a.55.55 0 0 1-.17.445l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256a.5.5 0 0 1-.146.05c-.342.06-.668-.254-.6-.642l.83-4.73L.173 6.765a.55.55 0 0 1-.172-.403.6.6 0 0 1 .085-.302.51.51 0 0 1 .37-.245zM8 12.027a.5.5 0 0 1 .232.056l3.686 1.894-.694-3.957a.56.56 0 0 1 .162-.505l2.907-2.77-4.052-.576a.53.53 0 0 1-.393-.288L8.001 2.223 8 2.226z"/>
        </svg>
                <p>Feedback</p>
            </div>
        </div>


  



        <div className={styles.footer}>
            <p>copyright &copy; 2023 All rights reserved.</p>

            <p>Designed and Created by Sizo Develops.</p>
        </div>
    </div>
  )
}

export async function getServerSideProps(context) {
    try {
      const session = await getSession(context);
  
      // Pass the session data as a prop to the component
      return {
        props: {
          session: session || null,
        },
      };
    } catch (error) {
      // Handle the fetch error gracefully
      throw new Error("Offline.")
    }
  }
  