import { Deta } from 'deta';
import { NextResponse } from 'next/server';

const deta = Deta(process.env.DETA_PROJECT_KEY)
const base = deta.Base("scana_feedback")

export async function POST(request) {
    try {
        const body = await request.json()
        let item = await base.fetch({key: body.id})
        if(item.count > 0){
            return NextResponse.json({error: "Feedback Duplicted!"},{status: 500})
        }
        else {
            await base.put(body.feedback, body.id)
            return NextResponse.json({data: "Success"}, {status: 200})
        }
    } catch (error) {
        return NextResponse.json({error: "Feedback Duplicted!"},{status: 500})
    }
}