import { NextResponse } from 'next/server'
import searchClient from './searchClient'

export async function GET() {
    const searchResult = await searchClient.search('')
    return NextResponse.json(searchResult)
}