import { NextResponse } from 'next/server'
import searchClient from './searchClient'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const searchResult = await searchClient.search(query || '')
    return NextResponse.json(searchResult)
}