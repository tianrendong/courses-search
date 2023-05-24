import { NextResponse } from 'next/server'
import client from '../client'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    try {
        const indexResult = await client.index(id || '')
        return NextResponse.json({results: indexResult})
    } catch (err: any) {
        return NextResponse.json({error: err.message || err})
    }
}