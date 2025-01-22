import { getUserCollection } from '@/lib/databaseFunctions';

import { NextResponse } from 'next/server';


export async function POST(request) {
    try {
    const body = await request.json();
    const user = await getUserCollection(body.key)
    
    return NextResponse.json(user)
    
    } catch (error) {
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
    
}