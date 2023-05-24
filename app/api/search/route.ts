import { NextResponse } from 'next/server'
import searchClient from './searchClient'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const searchResult = await searchClient.search(q || '')
    return NextResponse.json({results: searchResult})
    // await new Promise(resolve => setTimeout(resolve, 2000));
    // return NextResponse.json({results: [{id: "fake-id", payload: {code: "fake code", name: "fake name"}}]})
}