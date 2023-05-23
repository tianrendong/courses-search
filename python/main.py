from fastapi import FastAPI
from search import SearchClient
import json

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Welcome to the Course Search API."}

client = SearchClient()
with open("data/cs-courses.json", "r") as f:
    data = json.load(f)
client.index(data)

@app.get("/search/{query}")
async def search(query: str):
    search_result = client.search(query)
    return {"result": search_result}