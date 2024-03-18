"use client"
import { useDatabase } from "@/lib/context";
import React, { useRef } from "react";

import styles from "@/components/CSS/FaceRecognition.module.css";
function getCurrentDayOfWeek() {
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const currentDay = daysOfWeek[dayOfWeek];
  return currentDay;
  // return "saturday"
}
export default function ErrorModal({outcome, setOutcome, user, faces, saveRecords, currentFace}){
    const nameInputRef = useRef(null);
    const { screens, setScreens, signRegister, err, getUser, userData } =
      useDatabase();
  
    switch (outcome.type) {
      case "Success":
        return (
          <div className={styles.modal}>
            <i className={styles.icon}>
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
              </svg>
            </i>
            <h2>{err || "Signing..."}</h2>
            {/* <p>
              Hi {outcome.name.split(" ")[0]} having a nice day?.
            </p> */}
  
            <div
              onClick={() => {
                getUser(userData.school_code);
                if (screens.length > 1 && err !== "") {
                  setOutcome({});
                  screens.pop();
                  setScreens([...screens]);
                }
              }}
            >
              Ok
            </div>
          </div>
        );
      case "Fail":
        return (
          <div className={styles.modal2}>
            <i className={styles.icon2}>
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5" />
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
              </svg>
            </i>
            <h2>{outcome.name}</h2>
            <p>{`Hello ${
              outcome.name.split(" ")[0]
            } please enter your user code below to confirm`}</p>
            <input
              ref={nameInputRef}
              className={styles.usercode}
              placeholder="CONFIRM USER CODE"
            />
            <div
              onClick={async () => {
                let code = faces.find(
                  (item) =>
                    item.id === nameInputRef.current.value.trim().toUpperCase()
                );
                if (code && code.name === currentFace.record.name) {
                  await signRegister(userData.attendance[getCurrentDayOfWeek()], {
                    code: nameInputRef.current.value.toUpperCase().trim(),
                    initial: currentFace.record.initial,
                  });
                  setOutcome({ type: "Success", name: outcome.name });
  
                  // if (screens.length > 1) {
                  //   screens.pop();
                  //   setScreens([...screens]);
                  // }
                } else alert("Invalid Code!");
              }}
            >
              Sign Register
            </div>
          </div>
        );
      case "New":
        return (
          <div className={styles.modal3}>
            <i className={styles.icon3}>
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5" />
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
              </svg>
            </i>
            <h2>Record Facial Data</h2>
            <p>{`Hello ${
              outcome.name.split(" ")[0]
            } please enter your user code below to confirm`}</p>
            <input
              ref={nameInputRef}
              className={styles.usercode2}
              placeholder="CONFIRM USER CODE"
            />
            <div
              onClick={async () => {
                if (
                  nameInputRef.current.value.trim().toUpperCase() === user.code
                ) {
                  await saveRecords();
                  await signRegister(userData.attendance[getCurrentDayOfWeek()]);
                  setOutcome({ type: "Success", name: outcome.name });
  
                  // if (screens.length > 1) {
                  //   screens.pop();
                  //   setScreens([...screens]);
                  // }
                }
              }}
            >
              Register
            </div>
          </div>
        );
      default:
        return <></>;
    }
  };
  