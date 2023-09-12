import React from 'react'
import styles from "@/components/CSS/Dashboard.module.css"
import Calendar from './Calender'
import scanImage from '../../../public/icons/mdi_qrcode.png'
import codeImage from '../../../public/icons/vaadin_password.png'
import phoneImage from '../../../public/icons/mingcute_phone-fill.png'
import attendImage from '../../../public/icons/icon-park-outline_trend.png'
import emailImage from '../../../public/icons/mdi_email.png'
import rateImage from '../../../public/icons/carbon_review.png'
import Image from 'next/image'
import Code from './Code'


export default function Dashboard() {
  return (
    <div className={styles.dashboardCont}>
        <header className={styles.header}>
            <p>Dashboard</p>
            <div className={styles.dashProfile}></div>
        </header>

        <div className={styles.greeting}>
            <h1>GOOD MORNING</h1>
            <p>MR. SM MHLONGO</p>
        </div>

        <div className={styles.calendarHolder}>
            {/* <div className={styles.schoolLogo}></div>
            <div className={styles.calendar}>
                <Calendar/>
                
            </div> */}

            <Code/>
        </div>



        {/* <img src="https://i.ibb.co/Ps2ctv6/carbon-review.png" alt="carbon-review" border="0">
<img src="https://i.ibb.co/R3FyWDG/mdi-door-unavailable.png" alt="mdi-door-unavailable" border="0">
<img src="https://i.ibb.co/C8gwzSp/mdi-email.png" alt="mdi-email" border="0">
<img src="https://i.ibb.co/QJNy7K5/mdi-qrcode.png" alt="mdi-qrcode" border="0">
<img src="https://i.ibb.co/Wgw6bLq/mingcute-phone-fill.png" alt="mingcute-phone-fill" border="0">
<img src="https://i.ibb.co/wCsH3yk/pajamas-go-back.png" alt="pajamas-go-back" border="0">
<img src="https://i.ibb.co/gMsbF0q/vaadin-password.png" alt="vaadin-password" border="0"></img> */}

        <div className={styles.contacts}>
            <div className={styles.holder}>
                <div className={styles.image} style={{backgroundImage:"url(https://i.ibb.co/Wgw6bLq/mingcute-phone-fill.png)"}}>
                {/* <Image src={phoneImage} fill alt="Image"/> */}
                </div>
                <p>+27 72 234 5678</p>
            </div>
            <div className={styles.holder}>
                <div className={styles.image} style={{backgroundImage:"url(https://i.ibb.co/C8gwzSp/mdi-email.png)"}}>
                {/* <Image src={emailImage} fill alt="Image"/> */}
                </div>
                <p>youremail@domain.com</p>
            </div>
        </div>



        <div className={styles.buttons}>
            <div className={styles.btn}>
                <div className={styles.icon} style={{backgroundImage:"url(https://i.ibb.co/QJNy7K5/mdi-qrcode.png)"}}>
                {/* <Image src={scanImage} fill alt="Image"/> */}
                </div>
                <p>Scan QR</p>
            </div>
            <div className={styles.btn}>
                <div className={styles.icon} style={{backgroundImage:"url(https://i.ibb.co/gMsbF0q/vaadin-password.png)"}}>
                    {/* <Image src={codeImage} fill alt="Image"/> */}
                </div>
                <p>Enter Code</p>
            </div>
        </div>



        <div className={styles.buttons}>
            <div className={styles.btn}>
                <div className={styles.icon} style={{backgroundImage:"url(https://i.ibb.co/R3FyWDG/mdi-door-unavailable.png)"}}>
                {/* <Image src={attendImage} fill alt="Image"/> */}
                </div>
                <p>Attendance</p>
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
