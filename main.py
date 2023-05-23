import json
import os
import uuid
from typing import Dict, List

import cohere
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

load_dotenv()

QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

COHERE_SIZE_VECTOR = 4096  # Larger model

if not QDRANT_API_KEY:
    raise ValueError("QDRANT_API_KEY is not set")

if not QDRANT_URL:
    raise ValueError("QDRANT_URL is not set")

if not COHERE_API_KEY:
    raise ValueError("COHERE_API_KEY is not set")


class SearchClient:
    def __init__(
        self,
        qdrant_api_key: str = QDRANT_API_KEY,
        qdrant_url: str = QDRANT_URL,
        cohere_api_key: str = COHERE_API_KEY,
        collection_name: str = "cs-courses",
    ):
        self.qdrant_client = QdrantClient(
            url=qdrant_url, api_key=qdrant_api_key)
        self.collection_name = collection_name

        self.qdrant_client.recreate_collection(
            collection_name=self.collection_name,
            vectors_config=models.VectorParams(
                size=COHERE_SIZE_VECTOR, distance=models.Distance.COSINE
            ),
        )

        self.cohere_client = cohere.Client(api_key=cohere_api_key)

    # Qdrant requires data in float format
    def _float_vector(self, vector: List[float]):
        return list(map(float, vector))

    # Embedding using Cohere Embed model
    def _embed(self, texts: List[str]):
        return self.cohere_client.embed(texts=texts).embeddings[0]

    # Prepare Qdrant Points
    def _qdrant_format(self, data: List[Dict[str, str]]):
        points = [
            models.PointStruct(
                id=uuid.uuid4().hex,
                payload={"code": point["code"], "name": point["name"], "info": point["info"]},
                vector=self._float_vector(self._embed([point["info"]])),
            )
            for point in data
        ]

        return points

    # Index data
    def index(self, data: List[Dict[str, str]]):
        points = self._qdrant_format(data)

        result = self.qdrant_client.upsert(
            collection_name=self.collection_name, points=points
        )

        return result

    # Search using text query
    def search(self, query_text: str, limit: int = 3):
        query_vector = self._embed([query_text])

        return self.qdrant_client.search(
            collection_name=self.collection_name,
            query_vector=self._float_vector(query_vector),
            limit=limit,
        )

if __name__ == "__main__":
    client = SearchClient()

    with open("cs-courses.json", "r") as f:
        data = json.load(f)

    index_result = client.index(data)
    print(index_result)

    print("====")

    search_result = client.search(
        "",
    )

    print(search_result)