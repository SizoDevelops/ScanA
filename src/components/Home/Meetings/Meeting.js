"use client"
import React from 'react'
import styles from '@/components/CSS/Meeting.module.css'
import { useSelector } from 'react-redux';
export default function Meeting({meeting}) {
    const user = useSelector(state => state.User.value)

    const downloadAgenda = async () => {
      try {
        let res = await fetch("/api/download-agenda", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            key: user?.code.slice(0, user?.code.lastIndexOf("-")),
            fileName: meeting.fileName.trim()
          })
        });
    
        if (res.ok) {
          // Parse the response as ArrayBuffer
          let arrayBuffer = await res.arrayBuffer();
    
          if (arrayBuffer.byteLength === 0) {
            alert("File Not Found.");
            return;
          }
    
          // Create a Blob from ArrayBuffer
          let blob = new Blob([arrayBuffer], { type: "application/pdf" });
    
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = meeting.fileName; // Set desired filename
    
          // Optionally add styling and text to the link
          downloadLink.textContent = 'Download File';
    
          // Append the link to the document
          document.body.appendChild(downloadLink);
    
          // Click the link to trigger download
          downloadLink.click();
    
          // Remember to revoke the object URL after clicking:
          URL.revokeObjectURL(downloadLink.href);
    
          // Remove the link from the document (optional)
          document.body.removeChild(downloadLink);
        } else {
          alert("Network Issue. Retry.");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    function millisecondsToDate(milliseconds) {
        // Convert milliseconds to seconds
        const seconds = parseInt(milliseconds) / 1000;
      
        // Create a Date object from the seconds
        const dateObj = new Date(seconds * 1000);

        // Format the date as "day-month-year" with 3-character month name
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short", // Use "short" option for 3-character month names
          year: "numeric",
        });
      
        // Extract and format the time
        const hours = dateObj.getHours().toString().padStart(2, "0");
        const minutes = dateObj.getMinutes().toString().padStart(2, "0");
      
        // Combine date and time with separator
        const formattedDateTime = `${formattedDate} ${hours}:${minutes}`;
      
        return formattedDateTime;
      }
  return (
    <div className={styles.Meet}>
        <div className={styles.header}>
            <h4 style={meeting.date < Date.now() ?{color: "#fa3c3c"} : {}}>{meeting.date < Date.now() ? "Past Meeting" : "Upcoming Meeting"}</h4>

            <div>
            <h3>{meeting.title}</h3>
            <p>Venue: {meeting.venue}</p> 
            <p>Date: { millisecondsToDate(meeting.date)}</p> 
            </div>
           
        </div>

        <p className={styles.des}>{meeting.agenda_text.split(" ").slice(0, 25).join(" ") + "..."}</p>

        <div className={styles.pdf} onClick={downloadAgenda}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
  <path fillRule="evenodd" d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708z"/>
  <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
</svg>Download Agenda</div>
    </div>
  )
}
