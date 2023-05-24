import { NextResponse } from 'next/server'
import client from '../client'

export async function GET(req: Request, res: Response) {
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get('collection')
    if (!collection) {
        return NextResponse.json({error: "collection is required"})
    }
    const query = searchParams.get('q');
    const searchResult = await client.search(collection, query || '')
    return NextResponse.json({results: searchResult})
    // await new Promise(resolve => setTimeout(resolve, 2000));
    // return NextResponse.json({results: [{id: "fake-id", payload: {code: "fake code", name: "fake name"}}]})
}