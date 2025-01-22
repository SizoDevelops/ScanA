import { getFeedbackCollection, setFeedbackCollection } from '@/lib/databaseFunctions';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json()

        let item = await getFeedbackCollection(body.id)

        if(item){
            return NextResponse.json({error: "Feedback Duplicted!"},{status: 500})
        }
        else {
            await setFeedbackCollection(body.id, body.feedback)
            return NextResponse.json({data: "Success"}, {status: 200})
        }
    } catch (error) {
        return NextResponse.json({error: "Feedback Duplicted!"},{status: 500})
    }
}