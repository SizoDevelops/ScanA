"use client";
import React, { useEffect, useState } from "react";
import styles from "@/components/CSS/Calendar.module.css";
import { useDatabase } from "@/lib/context";


let objData = []
const Calendar = () => {
  const currentDate = new Date()
  
  const {user} = useDatabase()
  const [AttendanceData, setAttendance] = useState([])
  


  useEffect(() => {
    setAttendance([])
    const days = []
    if(Array.isArray(user.attendance.monday)){
      days.push(...user.attendance.monday)
    }
    if(Array.isArray(user.attendance.tuesday)){
      days.push(...user.attendance.tuesday)
    }
    if(Array.isArray(user.attendance.wednesday)){
      days.push(...user.attendance.wednesday)
    }
    if(Array.isArray(user.attendance.thursday)){
      days.push(...user.attendance.thursday)
    }
    if(Array.isArray(user.attendance.friday)){
      days.push(...user.attendance.friday)
    }
    setAttendance(days)
  },[user])
  const generateCalendar = (objectData) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const locale = "en-GB";
    const dayOfMonth = new Intl.DateTimeFormat(locale, {
      day: "numeric",
    }).format(currentDate);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const firstDayOfWeek = firstDay.getDay();
    const weeks = Math.ceil((daysInMonth + firstDayOfWeek) / 7);

    const calendar = [];

    let day = 1;

    for (let week = 0; week < weeks; week++) {
      const weekRow = [];

      for (let weekday = 0; weekday < 7; weekday++) {
        if ((week === 0 && weekday < firstDayOfWeek) || day > daysInMonth) {
          weekRow.push(
            <td key={`${week}-${weekday}`}>
              {/* Empty cell for days before the 1st and after the last day */}
            </td>
          );
        } else {
          const currentDate = new Date(year, month, day + 1);
          const isDateAvailable = objectData.some(obj => obj.date === currentDate.toISOString().split('T')[0] && obj.absent === false)
          const isDateAbsent = objectData.some(obj => obj.date === currentDate.toISOString().split('T')[0] && obj.absent === true)
          
          weekRow.push(
            <td key={`${week}-${weekday}`}>
              <div className={isDateAvailable ? styles.TD : isDateAbsent ? styles.TDR : styles.TDB} style={day === parseInt(dayOfMonth) ? { fontWeight: "700" } : {}}>
                {day}
                <div className={isDateAvailable ? styles.dot : isDateAbsent ? styles.dotRed : styles.dotBlue}></div>
              </div>
            </td>
          );

          day++;
        }
      }

      calendar.push(<tr key={week}>{weekRow}</tr>);
    }

    return calendar;
  };


  const monthOptions = { month: "long", year: "numeric" };

  return (
    <div className={styles.calender}>
      <h2>{currentDate.toLocaleDateString(undefined, monthOptions)}</h2>
      <div className={styles.line}></div>
      <table>
        <thead>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody>{generateCalendar( AttendanceData)}</tbody>
      </table>
    </div>
  );
};

export default Calendar;
