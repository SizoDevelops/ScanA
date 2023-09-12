"use client"
import React, { useState } from 'react';
import styles from '@/components/CSS/Calendar.module.css'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

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
          weekRow.push(<td key={`${week}-${weekday}`} />);
        } else {
          weekRow.push(
            <td key={`${week}-${weekday}`} >

                <div className={styles.TD}>
                    {day}
              <div className={styles.dot}></div>
                </div>
   
            </td>
          );
          day++;
        }
      }

      calendar.push(
        <tr key={week}>
          {weekRow}
        </tr>
      );
    }

    return calendar;
  };

  const monthOptions = { month: 'long', year: 'numeric' };

  return (
    <div className={styles.calender}>
      {/* <h2>{currentDate.toLocaleDateString(undefined, monthOptions)}</h2> */}
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
        <tbody>
          {generateCalendar()}
        </tbody>
      </table>
    </div>
  );
}

export default Calendar;
