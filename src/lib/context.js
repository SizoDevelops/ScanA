"use client";

import { signOut, useSession } from "next-auth/react";
import { useGeolocated } from "react-geolocated";
import { useDispatch } from "react-redux";
import { updateAttendance, userReducer } from "./Slice";
import moment from "moment";

const { createContext, useContext, useState, useEffect } = require("react");

export const Database = createContext();

export const useDatabase = () => {
  return useContext(Database);
};

export const DataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [absentLoading, setAbsentLoading] = useState(false);
  const { data: session, status } = useSession();
  const [userData, setUser] = useState(null);
  const [err, setErr] = useState("");
  const [screens, setScreens] = useState(["Calendar"]);
  const [onLines, setIsOnline] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    // Add event listeners for online/offline status changes
    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    // Initial check for online status
    setIsOnline(navigator.onLine);

    // Remove event listeners when the component is unmounted
    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  useEffect(() => {
    // setLoading(true)

    if (session && session.user) {
      getUser(session?.user.code.slice(0, session?.user.code.lastIndexOf("-")));
      
    }
  }, [session]);

  // lllllllllllllllllllllllllllllll

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: null,
      watchLocationPermissionChange: true,
      watchPosition: true,
    });

    function getCurrentDayOfWeek() {
      const today = moment();
      return today.format('dddd').toLowerCase();
    }


    function getCurrentWeek() {
      const today = moment();
      return today.week();
    }


    function getCurrentDate() {
      return moment().format('YYYY-MM-DD');
    }


  function getCurrentMilitaryTime() {
  const gmtPlus2Time = moment().utcOffset(2);
  return {
    hours: gmtPlus2Time.format('HH'),
    minutes: gmtPlus2Time.format('mm')
  };
}

  // lllllll

  function getAbsentDate(dayName, weekNumber) {
    const currentYear = moment().year();
    const firstDayOfYear = moment([currentYear, 0, 1]);
    const dayIndex = moment().day(dayName.toLowerCase());
  
    const firstDayOfWeekOne = firstDayOfYear.isoWeekday(dayIndex.isoWeekday());
    const targetDate = firstDayOfWeekOne.add(weekNumber - 1, 'weeks');
  
    return targetDate.format('YYYY-MM-DD');
  }

  const setAttendance = async (day,action, user = session?.user) => {
    const week = getCurrentWeek();
    const time = getCurrentMilitaryTime();
    const date = getAbsentDate(day, week);

    const data = {
      key: user?.code.slice(0, user?.code.lastIndexOf("-")),
      id: user?.code,
      current_day: day,
      action: action,
      attend: {
        week: week,
        timein: action === "signin" ? `${time.hours}:${time.minutes}` : null,
        timeout: action === "signout" ? `${time.hours}:${time.minutes}` : null,
        initial: user?.initial,
        absent: action === "signin" ? false : true,
        date: date,
        day: day,
      },
    };

    if (session?.user.code && userData?.school_code) {
      await fetch("/api/sign-register", {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data === null) {
            setErr("Successfully Signed!");
          } else if (data === "Already Signed") {
            setErr("Already Signed");
          }
        });
    }
  };

  // iiiiiiiiiiiiiiiiiiiiiiiii

  const markAbsent = async (reason, days) => {
    const day = getCurrentDayOfWeek();
    console.log(getAbsentDate(day, getCurrentWeek()));
    setAbsentLoading(true);
    const data = {
      key: session?.user.code.slice(0, session?.user.code.lastIndexOf("-")),
      id: session?.user.code,
      current_day: day,
      days: days,
      reason: reason,
      initial: session?.user.initial,
    };

    fetch("/api/update-absent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        setAbsentLoading(false);
        if (data.includes("success")) {
          setErr("Successfully Submitted");
        } else if (data.includes("Already Signed")) {
          setErr("Already Signed");
        } else if (data.includes("Not Available On Sunday!")) {
          setErr("Opps!! Not available on sunday.");
        }
        else{
          setErr("Opps!! Something went wrong.");
        }
      });
    dispatch(updateAttendance(data));
  };

  //   lllllllllllllllllllllllll

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const radius = 6371.0; // Radius of the Earth in kilometers

    // Convert latitude and longitude from degrees to radians
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    // Haversine formula
    const dlon = lon2Rad - lon1Rad;
    const dlat = lat2Rad - lat1Rad;

    const a =
      Math.sin(dlat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dlon / 2) ** 2;
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
  const getUser = async (data) => {
    
    await fetch("api/get-school", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: data }),
    })
      .then((data) => data.json())
      .then(async (data) => {
        // if (data) {
        //   await preSign(data);
        // }
        setUser(data);
        dispatch(
          userReducer(
            data?.members.find((member) => member.id === session?.user.id)
          )
        );
        // else signOut()
      })
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
       
      });
  };

 
  const signRegister = async (code, action, user = session?.user) => {
  setErr(""); // Reset any previous error
  
  // Validate action parameter
  if (!action || !['signin', 'signout'].includes(action)) {
    setErr("Invalid action.");
    return;
  }

  // Check if geolocation is available and enabled
  if (!isGeolocationAvailable) {
    setErr("Geolocation is not supported by your browser");
    return;
  }

  if (!isGeolocationEnabled) {
    setErr("Location Access Denied. Please enable location services.");
    return;
  }

  // Validate required data
  if (!userData) {
    setErr("User data not loaded");
    return;
  }

  if (!coords) {
    setErr("Location not available. Please wait...");
    return;
  }

  if (!user) {
    setErr("User session not found");
    return;
  }

  try {
    // Get user and school coordinates
    const userlat = coords.latitude;
    const userlon = coords.longitude;
    const schoollat = parseFloat(userData?.coordinates?.latitude);
    const schoollon = parseFloat(userData?.coordinates?.longitude);

    // Validate coordinates
    if (isNaN(schoollat) || isNaN(schoollon)) {
      setErr("Invalid coordinates");
      return;
    }

    // Calculate distance
    const distance = calculateDistance(userlat, userlon, schoollat, schoollon);
    const distanceInMeters = distance * 1000;
    const allowedDistance = parseInt(userData?.coordinates?.distance);

    // Check if within range
    if (distanceInMeters >= allowedDistance) {
      setErr(`You are out of range. Distance: ${distanceInMeters.toFixed(0)}m (Max: ${allowedDistance}m)`);
      return;
    }

    const currentDay = getCurrentDayOfWeek();

    // Check for weekends
    if (currentDay === "saturday" || currentDay === "sunday") {
      setErr("Not available on weekends");
      return;
    }

    // Check if attendance is configured for current day
    if (!(currentDay in userData?.attendance)) {
      setErr("No attendance configured for today");
      return;
    }

    const expectedCode = userData?.attendance[currentDay];

    // Validate expected code exists
    if (!expectedCode) {
      setErr("No code set for today");
      return;
    }

    // For sign-in, validate the code
    if (action === 'signin') {
      if (code === null || code === undefined || code === "") {
        setErr("Please enter the attendance code");
        return;
      }

      if (code.toUpperCase() !== expectedCode.toUpperCase()) {
        setErr("Invalid Code");
        return;
      }
    }

    // For sign-out, code validation is not required
    // Call attendance function with action
    await setAttendance(currentDay, action, user);

  } catch (error) {
    console.error("Sign register error:", error);
    setErr("An error occurred. Please try again.");
  }
};

  const value = {
    loading,
    signRegister,
    err,
    setErr,
    setScreens,
    screens,
    getCurrentMilitaryTime,
    getCurrentDayOfWeek,
    markAbsent,
    getCurrentWeek,
    userData,
    absentLoading,
    onLines,
    getUser,
   
  };

  return <Database.Provider value={value}>{children}</Database.Provider>;
};
