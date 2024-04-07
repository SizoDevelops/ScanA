const { createSlice } = require("@reduxjs/toolkit");
function getCurrentWeek() {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const daysSinceFirstDay = Math.floor((today - firstDayOfYear) / (24 * 60 * 60 * 1000));
    const currentWeek = Math.ceil((daysSinceFirstDay + 1) / 7);
    return currentWeek;
  }
function getAbsentDate(dayName, weekNumber) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
    const currentYear = new Date().getFullYear();
    const firstDayOfYear = new Date(Date.UTC(currentYear, 0, 1));
    const dayIndex = dayNames.indexOf(dayName.toLowerCase());
  
    // Calculate the first day of the specified weekday in week 1, starting with Monday
    const daysToFirstWeek = (dayIndex - firstDayOfYear.getDay() + 7) % 7;
    const firstDayOfWeekOne = new Date(firstDayOfYear.getTime() + daysToFirstWeek * 24 * 60 * 60 * 1000);
  
    // Adjust for the desired week number
    const targetDate = new Date(firstDayOfWeekOne.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
  
    return targetDate.toISOString().split("T")[0];
  }
const UserSlice = createSlice({
    name: "User",
    initialState: {
		value: {
            "attendance": {
                "friday": [],
                "monday": [],
                "thursday": [],
                "tuesday": [],
                "wednesday": []
            },
            "movement": [],
            "block_user": false,
            "code": "",
            "date": null,
            "email": "",
            "first_name": "",
            "id": "",
            "initial": "",
            "last_name": "",
            "pause_register": false,
            "persal": "",
            "phone_number": "",
            "position": "",
            "reason": null,
            "subjects": null,
            "title": ""
        }
	},
    reducers: {
        userReducer: (state, action) => {
            state.value = action.payload
        },
        updateAttendance: (state, action) => {
              const week = getCurrentWeek()
            
              action.payload.days.forEach(day => {
                if (action.payload.current_day !== "sunday", action.payload.current_day !== "saturday") {
                  state.value.attendance[day] =  state.value.attendance[day] || []; // Ensure attendance array exists
            
                  const calculatedDate = getAbsentDate(day, week);
                
                  if (!state.value.attendance[day].some(item => item.date === calculatedDate)) {
                    state.value.attendance[day].push({
                      week: week,
                      timein: "-",
                      timeout: "-",
                      initial: action.payload.initial,
                      absent: true,
                      reason: action.payload.reason,
                      date : calculatedDate,
                      day: day,
                  } );
                  } else {
                    return
                  }
                } else {
                  return
                }
              });
        }
    }

})

export const {userReducer, updateAttendance} = UserSlice.actions

export default UserSlice.reducer