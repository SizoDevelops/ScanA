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
import Feedback from './Feedback'
import FaceRecognition from './FaceRecognition'
import Movement from './Movement'
import Logo from './Logo'

export default function Dashboard() {
    const {screens, setScreens, getCurrentMilitaryTime, userData, onLines,loading} = useDatabase()
    const {data:session, status} = useSession()
    const userDa = useSelector(state => state.User.value)
    const [meetings, setMeetings] = useState([])
    useEffect(() => {
        setMeetings([])
    if(!onLines){
          throw new Error("Offline!")
    }
    else try{
           setMeetings(userData?.school_meetings.filter(items => {
            return (items.participants.some(item => userDa.position.includes(item)) && items.date > Date.now())
        }))
      }catch(error){
        return
      }
     
    }, [userData,  onLines])

    
    // useEffect(() => {
    //     const handleBackButton = (event) => {
    //       // Your custom logic here
     
    //       // Uncomment the line below to allow the default back button behavior
    //     //   history.goBack();
    
    //       // Prevent the default back button behavior
    //       event.preventDefault();
    //     };
    
    //     // Add event listener for the popstate event (back/forward button press)
    //     window.addEventListener('beforeunload', handleBackButton);
    
    //     // Cleanup the event listener when the component unmounts
    //     return () => {
    //       window.removeEventListener('beforeunload', handleBackButton);
    //     };
    //   }, [history]);
    

if(status === "loading" || loading){
    return <Loader/>
}
else if (!session) {
    throw new Error('User is not authenticated. Please sign in.');
  }

 else return (
    <div className={styles.dashboardCont}>
        <header className={styles.header}>
            <p>Dashboard</p>
            <Logo bgColor={"#0099F1"} widthV={381} heightV={50} width={50} height={60}/>
        </header>

        <div className={styles.greeting}>
            <h1>{getCurrentMilitaryTime().hours < 12 ? "GOOD MORNING" : getCurrentMilitaryTime().hours >= 12 && getCurrentMilitaryTime().hours < 18 ? "GOOD AFTERNOON" : "GOOD EVENING"}</h1>
            <p>{userDa?.title.toUpperCase()} {userDa?.initial.toUpperCase()} {userDa?.last_name.toUpperCase()}</p>
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
                : screens[screens.length - 1] === "FaceRecognition" 
                ? <FaceRecognition/>
                : screens[screens.length - 1] === "Meetings" 
                ? <Meetings/>
                :screens[screens.length - 1] === "Feedback" 
                ? <Feedback/>
                :screens[screens.length - 1] === "Movement" 
                ? <Movement/>
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
            <svg className={styles.image} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 19 32"><g fill="currentColor"><path d="M1.5 32h16c.827 0 1.5-.673 1.5-1.5v-29c0-.827-.673-1.5-1.5-1.5h-16C.673 0 0 .673 0 1.5v29c0 .827.673 1.5 1.5 1.5zM1 1.5a.5.5 0 0 1 .5-.5h16a.5.5 0 0 1 .5.5v29a.5.5 0 0 1-.5.5h-16a.5.5 0 0 1-.5-.5v-29z"/><path d="M2.5 27h14a.5.5 0 0 0 .5-.5v-21a.5.5 0 0 0-.5-.5h-14a.5.5 0 0 0-.5.5v21a.5.5 0 0 0 .5.5zM3 6h13v20H3V6z"/><circle cx="10" cy="29" r="1"/><path d="M7.5 4h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0 0 1z"/></g></svg>
                <p>{userDa?.phone_number || "Not Provided"}</p>
            </div>
            <div className={styles.holder}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M21 9v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9c0-1.11.6-2.08 1.5-2.6l8-4.62l8 4.62c.9.52 1.5 1.49 1.5 2.6M3.72 7.47l7.78 5.03l7.78-5.03l-7.78-4.54l-7.78 4.54m7.78 6.24L3.13 8.28C3.05 8.5 3 8.75 3 9v9a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V9c0-.25-.05-.5-.13-.72l-8.37 5.43Z"/></svg>
                <p>{userDa?.email}</p>
            </div>
        </div>



        <div className={styles.buttons}>
        <div className={styles.btn} onClick={() => {
                if(screens.length > 1){
                    screens.pop()
                    setScreens([...screens])
                }
                
               
            }} style={screens.length  > 1 ? {opacity: "1"} : {opacity: "0.4"}}>
               <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27"><path fill="currentColor" d="m4 10l-.707.707L2.586 10l.707-.707zm17 8a1 1 0 1 1-2 0zM8.293 15.707l-5-5l1.414-1.414l5 5zm-5-6.414l5-5l1.414 1.414l-5 5zM4 9h10v2H4zm17 7v2h-2v-2zm-7-7a7 7 0 0 1 7 7h-2a5 5 0 0 0-5-5z"/></svg>
                <p>Back</p>
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
               <svg className={styles.icon}xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#fff"  viewBox="0 0 16 16">
  <path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1-.5-.5M.5 12a.5.5 0 0 1 .5.5V15h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H15v-2.5a.5.5 0 0 1 .5-.5M4 4h1v1H4z"/>
  <path d="M7 2H2v5h5zM3 3h3v3H3zm2 8H4v1h1z"/>
  <path d="M7 9H2v5h5zm-4 1h3v3H3zm8-6h1v1h-1z"/>
  <path d="M9 2h5v5H9zm1 1v3h3V3zM8 8v2h1v1H8v1h2v-2h1v2h1v-1h2v-1h-3V8zm2 2H9V9h1zm4 2h-1v1h-2v1h3zm-4 2v-1H8v1z"/>
  <path d="M12 9h2V8h-2z"/>
</svg>
                <p>Scan QR</p>
             </div>


            <div className={styles.btn} onClick={() => {
                
                if(!screens.find(item => item === "FaceRecognition")){
                    setScreens(prep => [...prep, "FaceRecognition"])
                 }
                 else if(screens.includes("FaceRecognition")){
                     
                     setScreens([...screens.filter(item => item !== "FaceRecognition"), "FaceRecognition"])
                     
                 }
                 else {
                    return
                 }
            }}>
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff"  viewBox="0 0 16 16">
  <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z"/>
  <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
</svg>
                <p>Facial Scan</p>
            </div>


        </div>



        <div className={styles.buttons}>
         
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
                
                if(!screens.find(item => item === "Movement")){
                    setScreens(prep => [...prep, "Movement"])
                 }
                 else if(screens.includes("Movement")){
                     
                     setScreens([...screens.filter(item => item !== "Movement"), "Movement"])
                     
                 }
                 else {
                    return
                 }}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20"><path fill="#fff" d="M11 16.788q-.137 0-.213-.08q-.077-.081-.123-.195q-.316-.798-.726-1.38q-.41-.581-.82-1.121q-.52-.689-.915-1.389q-.395-.7-.395-1.738q0-1.323.935-2.258q.934-.935 2.257-.935t2.257.935q.935.935.935 2.258q0 1.038-.395 1.738t-.914 1.389q-.41.54-.82 1.122q-.411.581-.723 1.381q-.05.131-.127.202q-.076.071-.213.071Zm.003-4.846q.445 0 .75-.307q.305-.308.305-.753t-.308-.75t-.753-.305q-.445 0-.75.307q-.305.308-.305.753q0 .446.308.75t.753.305ZM11 20q-3.333 0-5.667-2.333Q3 15.335 3 12.003q0-1.666.626-3.121t1.713-2.543q1.088-1.087 2.542-1.713Q9.334 4 10.999 4q1.664 0 3.12.626q1.454.626 2.542 1.713q1.087 1.088 1.713 2.542Q19 10.335 19 12v1.412l2.037-2.062l.713.688l-3.25 3.25l-3.25-3.25l.713-.688L18 13.387V12q0-2.9-2.05-4.95T11 5Q8.1 5 6.05 7.05T4 12q.006 2.92 2.043 4.96Q8.081 19 11 19q1.406 0 2.588-.499q1.183-.5 2.172-1.386l.732.714q-1.129 1.027-2.54 1.599Q12.543 20 11 20Z"/></svg>
                <p>Movement</p>
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
                <p>More</p>
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
  