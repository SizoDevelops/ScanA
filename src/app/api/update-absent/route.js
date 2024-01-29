import { Deta } from "deta";
import { NextResponse } from "next/server";

const deta = Deta(process.env.DETA_PROJECT_KEY);
const db = deta.Base("schools_db");

export async function POST(request) {
  try{
    const body = await request.json();
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
  const week = getCurrentWeek()
  const getSchool = await db.get(body.key);
  const updated_user = getSchool.members.find((elem) => elem.code === body.id);

  let errors = []; // Array to collect any errors encountered

  body.days.forEach(day => {
    if (body.current_day !== "sunday") {
      updated_user.attendance[day] = updated_user.attendance[day] || []; // Ensure attendance array exists

      const calculatedDate = getAbsentDate(day, week);
    
      if (!updated_user.attendance[day].some(item => item.date === calculatedDate)) {
        updated_user.attendance[day].push({
          week: week,
          timein: "-",
          timeout: "-",
          initial: body.initial,
          absent: true,
          reason: body.reason,
          date : calculatedDate,
          day: day,
      } );
      } else {
        errors.push("Already Signed" );
      }
    } else {
      errors.push( "Not Available On Sunday!");
    }
  });

  const members = getSchool.members.filter((item) => item.code !== body.id);
  const newMembers = [...members, updated_user];
  const updateUser = await db.update({ members: newMembers }, body.key);

  if (errors.length > 0) {
    // Handle errors, e.g., return a response with the errors array
    return NextResponse.json(errors);
  } else {
    return NextResponse.json(updateUser);
  }
  }catch(error){
    throw new Error("Connection Failed!")
  }
}
