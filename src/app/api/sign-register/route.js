import { Deta } from 'deta'
import { NextResponse } from 'next/server';

const deta = Deta(process.env.DETA_PROJECT_KEY)
const db = deta.Base("schools_db")

export async function POST(request) {
   try{
    const body = await request.json();

    const getSchool = await db.get(body.key)
    // Find the member that has the ID
    const updated_user = getSchool.members.find(elem => elem.code === body.id)

  if(body.current_day === 'monday'){
    if(Array.isArray(updated_user.attendance.monday)){
   
         if(!updated_user.attendance.monday.find(item => item.date === body.attend.date)){
                     updated_user.attendance.monday.push(body.attend)
            }
            else{
              return NextResponse.json("Already Signed")
            }
   }
  else {
   updated_user.attendance.monday = new Array(body.attend)
  }
    }


    if(body.current_day === 'tuesday'){
        if(Array.isArray(updated_user.attendance.tuesday)){
            if(!updated_user.attendance.tuesday.find(item => item.date === body.attend.date)){
                updated_user.attendance.tuesday.push(body.attend)
            }
            else{
              return NextResponse.json("Already Signed")
            }
            
       }
      else {
       updated_user.attendance.tuesday = new Array(body.attend)
      }
    }
    if(body.current_day === 'wednesday'){
        if(Array.isArray(updated_user.attendance.wednesday)){
            
             if(!updated_user.attendance.wednesday.find(item => item.date === body.attend.date)){
                updated_user.attendance.wednesday.push(body.attend)
            }
            else{
              return NextResponse.json("Already Signed")
            }
       }
      else {
       updated_user.attendance.wednesday = new Array(body.attend)
      }
    }
    if(body.current_day === 'thursday'){
        if(Array.isArray(updated_user.attendance.thursday)){
           
            if(!updated_user.attendance.thursday.find(item => item.date === body.attend.date)){
                 updated_user.attendance.thursday.push(body.attend)
            }
            else{
              return NextResponse.json("Already Signed")
            }
       }
      else {
       updated_user.attendance.thursday = new Array(body.attend)
      }
    }
    if(body.current_day === 'friday'){
        if(Array.isArray(updated_user.attendance.friday)){
           
            if(!updated_user.attendance.friday.find(item => item.date === body.attend.date)){
                 updated_user.attendance.friday.push(body.attend)
            }
            else{
              return NextResponse.json("Already Signed")
            }
       }
      else {
       updated_user.attendance.friday = new Array(body.attend)
      }
    }
   // Remove the original member
    const members = getSchool.members.filter(item => item.code !== body.id)


    // ReAdd the member with the updated keys
    const newM = members.concat([updated_user])
    const updateUser = await  db.update({members: newM}, body.key)

    return NextResponse.json(updateUser)
   }catch(error){
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
   }
  }
