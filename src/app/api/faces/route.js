import { getUserCollection, updateFaces } from '@/lib/databaseFunctions';

import { NextResponse } from 'next/server';


export async function POST(request) {
    try {
        const body = await request.json()
        const db = await getUserCollection(body.key)
        const faces = db?.user_faces || [];

        if(body.methods === "update"){

            // Push the compressed data to the faces array
            if(!faces.find(elem => elem.id === body.faceRecord.id)){
                    faces.push(body.faceRecord);
                    await updateFaces(body.key, faces);
                    return NextResponse.json(faces)
            }
            else {
                return NextResponse.json(faces)
            }
           
            
           
        }
        else if(body.methods === "delete"){
            const newFaces = faces.filter(items => items.id !== body.faceRecord.id)
            let s = await updateFaces(body.key, faces);
            return NextResponse.json("Face Deleted Successfully")
        }
        else {
            return NextResponse.json("Error Here")
        }
       
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}