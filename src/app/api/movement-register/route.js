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

    const movement = updated_user.movement || [];
    if(!getSchool.movementCodes.find(item => item.code === body.data.movement_code)){
        return NextResponse.json("Invalid");
    }
    else if(movement.find(elem => elem.movement_code === body.data.movement_code || elem.date === body.data.date)){
        return NextResponse.json("Already Signed!");
    }
    else {
        movement.push(body.data)
        updated_user.movement = movement;
        const members = getSchool.members.filter(item => item.code !== body.id)


        // ReAdd the member with the updated keys
        const newM = members.concat([updated_user])
        const updateUser = await  db.update({members: newM}, body.key)
    
        return NextResponse.json("User Updated")
    }
  
   // Remove the original member

   }catch(error){
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
   }
  }
