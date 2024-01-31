import { Deta } from 'deta'
import { NextResponse } from 'next/server';

const deta = Deta(process.env.DETA_PROJECT_KEY)
const db = deta.Base("schools_db")

export async function POST(request) {
    try {
    const body = await request.json();
    const user = await db.get(body.key)
    return NextResponse.json(user)
    
    } catch (error) {
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
    
}