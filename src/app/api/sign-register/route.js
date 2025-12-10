import { getUserCollection, updateCollectionMembers } from '@/lib/databaseFunctions';

import { NextResponse } from 'next/server';


export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body; // 'signin' or 'signout'

    const getSchool = await getUserCollection(body.key);
    const updated_user = getSchool.members.find(elem => elem.code === body.id);

    if (!updated_user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dayKey = body.current_day;
    const dayAttendance = updated_user.attendance[dayKey];

    if (action === 'signin') {
      // Sign In Logic
      if (Array.isArray(dayAttendance)) {
        if (!dayAttendance.find(item => item.date === body.attend.date)) {
          dayAttendance.push(body.attend);
        } else {
          return NextResponse.json("Already Signed");
        }
      } else {
        updated_user.attendance[dayKey] = [body.attend];
      }
    } else if (action === 'signout') {
      // Sign Out Logic
      if (!Array.isArray(dayAttendance)) {
        return NextResponse.json("No sign-in record found");
      }

      const attendanceRecord = dayAttendance.find(item => item.date === body.attend.date);
      
      if (!attendanceRecord) {
        return NextResponse.json("No sign-in record found for this date");
      }

      if (attendanceRecord.timeout !== null) {
        return NextResponse.json("Already signed out");
      }

      attendanceRecord.timein = attendanceRecord.timein;
      attendanceRecord.timeout = body.attend.timeout;
      attendanceRecord.absent = false;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update database
    const members = getSchool.members.filter(item => item.code !== body.id);
    const newM = members.concat([updated_user]);
    const updateUser = await updateCollectionMembers(body.key, newM);

    return NextResponse.json(updateUser);
  } catch (error) {
    console.error("Attendance error:", error);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  }
}