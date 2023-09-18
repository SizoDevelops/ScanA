"use client"

import React, { useEffect, useState } from 'react'
import styles from "@/components/CSS/Dashboard.module.css"
import Calendar from './Calender'
import Code from './Code'
import QR from './QR'
import { useGeolocated } from 'react-geolocated'
import { signOut, useSession } from 'next-auth/react'
import { useDatabase } from '@/lib/context'
import Loader from './Loader'

export default function Dashboard() {
    const [screens, setScreens] = useState(["Calender"])
    const {loading, user} = useDatabase()




if(loading){
    return <Loader/>
}

 else return (
    <div className={styles.dashboardCont}>
        <header className={styles.header}>
            <p>Dashboard</p>
            <div className={styles.dashProfile} onClick={signOut}></div>
        </header>

        <div className={styles.greeting}>
            <h1>GOOD MORNING</h1>
            <p>{user.title} {user.initial} {user.last_name}</p>
        </div>

        <div className={styles.calendarHolder}>
            {
                screens[screens.length - 1] === "Code" ? <>
                    <Code/>
                   
                </>
                : screens[screens.length - 1] === "QR" 
                ? <QR/>
                :
                <>
                     <div className={styles.schoolLogo}></div>
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
                <p>{user.phone_number}</p>
            </div>
            <div className={styles.holder}>
                <div className={styles.image} style={{backgroundImage:"url(https://i.ibb.co/C8gwzSp/mdi-email.png)"}}>
                {/* <Image src={emailImage} fill alt="Image"/> */}
                </div>
                <p>{user.email}</p>
            </div>
        </div>



        <div className={styles.buttons}>
    
            <div className={styles.btn} onClick={() => {
                setScreens(prep => [...prep, "Code"])
            }}>
                <div className={styles.icon} style={{backgroundImage:"url(https://i.ibb.co/gMsbF0q/vaadin-password.png)"}}>
                    {/* <Image src={codeImage} fill alt="Image"/> */}
                </div>
                <p>Enter Code</p>
            </div>

            <div className={styles.btn} onClick={() => {
                setScreens(prep => [...prep, "QR"])
            }}>
                <div className={styles.icon} style={{backgroundImage:"url(https://i.ibb.co/QJNy7K5/mdi-qrcode.png)"}}>
                {/* <Image src={scanImage} fill alt="Image"/> */}
                </div>
                <p>Scan QR</p>
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
         
            <div className={styles.btn}>
                <div className={styles.icon} style={{backgroundImage:"url(https://i.ibb.co/Ps2ctv6/carbon-review.png)"}}>
                    {/* <Image src={rateImage} fill alt="Image"/> */}
                </div>
                <p>Feedback</p>
            </div>
        </div>
    </div>
  )
}
