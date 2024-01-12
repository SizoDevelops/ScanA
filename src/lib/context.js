"use client"

import { signOut, useSession } from "next-auth/react"
import { useGeolocated } from "react-geolocated"
import { useDispatch } from "react-redux"
import { updateAttendance, userReducer } from "./Slice"

const { createContext, useContext, useState, useEffect } = require("react")

export const Database = createContext()

export const useDatabase = () => {
    return useContext(Database)
}

export const DataProvider = ({children}) => {
    const [loading, setLoading] = useState(true)
    const {data:session} = useSession()
    const [userData, setUser] = useState(null)
    const [user, setUserData] = useState(null)
    const [err, setErr] = useState("")
    const [screens, setScreens] = useState(["Calendar"])
    const dispatch = useDispatch()
    useEffect(() => {
        setLoading(true)
       if(session && session.user){
        setUserData(session?.user)
        getUser(session?.user.code.slice(0, session?.user.code.lastIndexOf("-")))
        setLoading(false)
       }
    }, [session])

// lllllllllllllllllllllllllllllll

const { coords, isGeolocationAvailable, isGeolocationEnabled } =
useGeolocated({
    positionOptions: {
        enableHighAccuracy: true,
    },
    userDecisionTimeout: null,
    watchLocationPermissionChange: true,
    watchPosition: true

});



function getCurrentWeek() {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const daysSinceFirstDay = Math.floor((today - firstDayOfYear) / (24 * 60 * 60 * 1000));
    const currentWeek = Math.ceil((daysSinceFirstDay + 1) / 7);
    return currentWeek;
  }

  function getCurrentDayOfWeek() {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const currentDay = daysOfWeek[dayOfWeek];
    return currentDay;
    // return "saturday"
  }

  function getCurrentDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0'); // Get the day and pad with leading zeros if necessary
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Get the month (months are 0-based) and pad with leading zeros if necessary
    const year = today.getFullYear(); // Get the year
  
    return `${year}-${month}-${day}`;
  }
  function getCurrentMilitaryTime() {
    const now = new Date();
    const gmtPlus2Time = new Date(now.getTime() + (2 * 60 * 60 * 1000));  // Add 2 hours for GMT+2
    const hours = gmtPlus2Time.getUTCHours().toString().padStart(2, '0');  // Ensure 2 digits
    const minutes = gmtPlus2Time.getUTCMinutes().toString().padStart(2, '0');  // Ensure 2 digits

    return {hours, minutes};
}

// lllllll

const setAttendance = async () => {
    const day = getCurrentDayOfWeek()
    const date = getCurrentDate()
    const week = getCurrentWeek()
    const time = getCurrentMilitaryTime()


    const data = {
        key: userData?.key,
        id: session?.user.code,
        current_day: day,
        attend: {
            week: week,
            timein: time.hours <= 7 ? `${time.hours}:${time.minutes}` : `7:${time.minutes}`,
            timeout: "14:40",
            initial: session?.user.initial,
            absent: false,
            date : date,
            day: day,
        } 
    }

    if(session?.user.code && userData?.key){  
       
    await fetch("/api/sign-register", {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
    .then((data) => {
        
        if(data === null){
        setErr("Successfully Scanned")
        }
        else if(data === "Already Signed"){
            setErr("Already Signed")
        }
        
    })
    
    }
 
  }

// iiiiiiiiiiiiiiiiiiiiiiiii

  const markAbsent = async(reason, days) => {
    const day = getCurrentDayOfWeek()
   
    const data = {
        key: userData?.key,
        id: session?.user.code,
        current_day: day,
        days: days,
        reason: reason,
        initial: session?.user.initial
    }
    
    fetch("/api/update-absent", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
    .then((data) => {
        
        if(data === null){
        setErr("Successfully Submitted")
        }
        else if(data.includes("Already Signed")){
            setErr("Already Signed")
        }
        else if (data.includes("Not Available On Sunday!")){
            setErr("Opps!! Not available on sunday.")
        }
        
    })
    dispatch(updateAttendance(data))
  }


//   lllllllllllllllllllllllll

function calculateDistance(lat1, lon1, lat2, lon2) {
    const radius = 6371.0;  // Radius of the Earth in kilometers

    // Convert latitude and longitude from degrees to radians
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    // Haversine formula
    const dlon = lon2Rad - lon1Rad;
    const dlat = lat2Rad - lat1Rad;

    const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate the distance in kilometers
    const distance = radius * c;
    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Coordinates for two points (in this case, New York and Los Angeles)
// const latNY = -27.022276555585872
// const lonNY = 30.428096195860743;
// const latLA = -27.02202805853633
// const lonLA = 30.426443955067636


// ..............
// ..............
const getUser = async(data)=>{

    await fetch("api/get-school", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({key: data})
    
    
      }).then(data => data.json())
      .then(data => {
        setUser(data)
        
        dispatch(userReducer(data.members.find(member => member.id === session?.user.id)))
        // else signOut()
      })
      
     
    
     
    }
      
     
    const signRegister = (code) => {
        setErr("")
        if(isGeolocationAvailable && isGeolocationEnabled){
            if(userData && coords){
               const userlat = coords.latitude
               const userlon = coords.longitude
               const schoollat = parseFloat(userData?.coordinates.latitude)
               const schoollon = parseFloat(userData?.coordinates.longitude)
  
               const distance = calculateDistance(userlat, userlon, schoollat, schoollon);
  
               if(distance.toFixed(2) * 1000 < parseInt(userData?.coordinates.distance )){
                     if(getCurrentDayOfWeek() === "monday"&& code !== null && code.toUpperCase() === userData.attendance.monday ){
                        setAttendance()
                        
                     }
                     else if(getCurrentDayOfWeek() === "tuesday"&& code !== null && code.toUpperCase() === userData.attendance.tuesday){
                        setAttendance()
                     }
                     else if(getCurrentDayOfWeek() === "wednesday" && code !== null&& code.toUpperCase() === userData.attendance.wednesday){
                        setAttendance()
                     }
                     else if(getCurrentDayOfWeek() === "thursday"&& code !== null && code.toUpperCase() === userData.attendance.thursday){
                        setAttendance()
                     }
                     else if(getCurrentDayOfWeek() === "friday"&& code !== null && code.toUpperCase() === userData.attendance.friday){
                        setAttendance()
                     }
                     else {
                       
                        setErr("Invalid Code")
                    
                        
                     }
               }
               else {
                  
               
                setErr("You are out of range.")
                
              
               }
            }
        }
    }



    const value  = {
        loading,
        signRegister,
        user,
        err,
        setErr,
        setScreens,
        screens,
        getCurrentMilitaryTime,
        getCurrentDayOfWeek,
        markAbsent,
        getCurrentWeek,
        userData
    }

    return(
        <Database.Provider value={value}>
            {children}
        </Database.Provider>
    )
}