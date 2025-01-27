
import { getUserCollection, updateCollectionMembers } from "@/lib/databaseFunctions";
import moment from "moment";
import { NextResponse } from "next/server";

function getCurrentWeek() {
  const today = moment();
  return today.week();
}

 function getAbsentDate(dayName, weekNumber) {
    const currentYear = moment().year();
    const firstDayOfYear = moment([currentYear, 0, 1]);
    const dayIndex = moment().day(dayName.toLowerCase());
  
    const firstDayOfWeekOne = firstDayOfYear.isoWeekday(dayIndex.isoWeekday());
    const targetDate = firstDayOfWeekOne.add(weekNumber - 1, 'weeks');
  
    return targetDate.format('YYYY-MM-DD');
  }

export async function POST(request) {
  try{
    const body = await request.json();
    
  
  const week = getCurrentWeek()
  const getSchool = await getUserCollection(body.key);
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
  const updateUser = await updateCollectionMembers(body.key, newMembers);

  if (errors.length > 0) {
    // Handle errors, e.g., return a response with the errors array
    return NextResponse.json(errors);
  } else {
    return NextResponse.json(["success"]);
  }
  }catch(error){
    console.log(error)
  }
}
