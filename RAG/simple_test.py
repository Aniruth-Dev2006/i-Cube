import requests
import json

# Test the RAG API without Gemini hitting quota
query = "give me a lawyer detail for the civil section"

print(f"Query: '{query}'\n")

# Send request
response = requests.post(
    "http://localhost:8000/query",
    json={"query": query},
    headers={"Content-Type": "application/json"}
)

result = response.json()

print(f"Sources Retrieved: {len(result.get('sources', []))}\n")

if result.get('sources'):
    for i, source in enumerate(result['sources'], 1):
        print(f"[{i}] Similarity: {source['similarity']:.3f}")
        print(f"Content: {source['content'][:300]}")
        if 'Civil Law' in source['content']:
            print("✓✓✓ CONTAINS CIVIL LAW ✓✓✓")
        print()

print("\n=== CHECK THE RAG API TERMINAL WINDOW FOR DEBUG OUTPUT ===")
