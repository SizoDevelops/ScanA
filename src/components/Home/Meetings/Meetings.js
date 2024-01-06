"use client"
import React, { useEffect } from 'react'
import styles from '../../CSS/Meeting.module.css'
import Meeting from './Meeting'
import { useDatabase } from '@/lib/context'
export default function Meetings() {
    const {userData} = useDatabase()
    const meetings = userData?.school_meetings.filter(item=>item.date > Date.now()).sort((a,b) => {
        if(a.date > b.data) return 1;
        else if(a.date < b.date) return -1;
        else return 0;
    })
    const meetingsPast = userData?.school_meetings.filter(item=>item.date < Date.now()).sort((a,b) => {
        if(a.date < b.data) return 1;
        else if(a.date > b.date) return -1;
        else return 0;
    })
  
  return (
    <div className={styles.Meetings}>
        {
            meetings ?
            meetings.concat(meetingsPast).slice(0, 4).map((meeting, index) => (
                  <Meeting key={index} meeting={meeting}/>
            ))
            : 
            <></>
        }
    </div>
  )
}
