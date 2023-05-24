import cohere from 'cohere-ai'
import { v4 } from 'uuid'
import { QdrantClient } from '@qdrant/js-client-rest'

const DATA_PATH = new Map<string, string>([
    ["cs-courses", 'data/cs-courses.json'],
]);

interface Point {
    code: string
    name: string
    info: string
}

class Client {
    private qdrantClient: QdrantClient

    constructor() {
        this.qdrantClient = new QdrantClient({
            url: process.env.QDRANT_URL || '',
            apiKey: process.env.QDRANT_API_KEY || '',
        });
        cohere.init(process.env.COHERE_API_KEY || '');
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
                const vector = await this.embed([point.code, point.name, point.info])
                return {
                    id: v4(),
                    payload: { code: point.code, name: point.name, info: point.info },
                    vector: this.floatVector(vector),
                }
            })
        )

        return points
    }

    // Index data
    public async index(id: string): Promise<any> {
        const path = DATA_PATH.get(id)
        if (!path) {
            throw new Error(`Invalid id: ${id}`)
        }
        const fs = require('fs')
        const data: Point[] = JSON.parse(fs.readFileSync(path).toString())
        this.qdrantClient.recreateCollection(id, {
            vectors: {
                size: 4096,
                distance: 'Cosine',
            },
        });

        const points = await this.qdrantFormat(data)
        return this.qdrantClient.upsert(id, { points })
    }

    // Search using text query
    public async search(collection: string, query: string, limit: number = 5): Promise<any> {
        const queryVector = await this.embed([query])

        return this.qdrantClient.search(collection, {
            vector: this.floatVector(queryVector),
            limit,
        })
    }
}

const client = new Client()

export default client