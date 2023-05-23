import cohere from 'cohere-ai'
import { uuid } from 'uuidv4'
import { QdrantClient } from '@qdrant/js-client-rest'

// const COHERE_SIZE_VECTOR = 4096 // Larger model

interface Point {
    code: string
    name: string
    info: string
}

class SearchClient {
    private qdrantClient: QdrantClient
    private collectionName: string

    constructor(
        qdrantApiKey: string,
        qdrantUrl: string,
        cohereApiKey: string,
        collectionName: string
    ) {
        this.qdrantClient = new QdrantClient({
            url: qdrantUrl,
            apiKey: qdrantApiKey,
        });
        this.collectionName = collectionName

        // this.qdrantClient.createCollection(collectionName, {
        //     vectors: {
        //         size: COHERE_SIZE_VECTOR,
        //         distance: 'Cosine',
        //     },
        // });

        cohere.init(cohereApiKey);
    }

    // Qdrant requires data in float format
    private floatVector(vector: number[]): number[] {
        return vector.map((value) => parseFloat(value.toFixed(6)))
    }

    // Embedding using Cohere Embed model
    private async embed(texts: string[]): Promise<number[]> {
        const embedRequest = { texts }
        const response = await cohere.embed(embedRequest)
        return response.body.embeddings[0]
    }

    // Prepare Qdrant Points
    private async qdrantFormat(data: Point[]): Promise<any[]> {
        const points = await Promise.all(
            data.map(async (point) => {
                const vector = await this.embed([point.name, point.info])
                return {
                    id: uuid(),
                    payload: { code: point.code, name: point.name, info: point.info },
                    vector: this.floatVector(vector),
                }
            })
        )

        return points
    }

    // Index data
    public async index(data: Point[]): Promise<any> {
        const points = await this.qdrantFormat(data)
        const result = await this.qdrantClient.upsert(this.collectionName, { points })
        return result
    }

    // Search using text query
    public async search(queryText: string, limit: number = 3): Promise<any> {
        const queryVector = await this.embed([queryText])

        return this.qdrantClient.search(this.collectionName, {
            vector: this.floatVector(queryVector),
            limit,
        })
    }
}

const QDRANT_API_KEY = process.env.QDRANT_API_KEY || ''
const QDRANT_URL = process.env.QDRANT_URL || ''
const COHERE_API_KEY = process.env.COHERE_API_KEY || ''
const searchClient = new SearchClient(QDRANT_API_KEY, QDRANT_URL, COHERE_API_KEY, "cs-courses")

// const fs = require('fs')
// try {
//     const data = JSON.parse(fs.readFileSync('../data/cs-courses.json').toString())
//     console.log("DEBUG:", data[0])
// } catch (err) {
//     console.log('DEBUG', err)
// }
export default searchClient