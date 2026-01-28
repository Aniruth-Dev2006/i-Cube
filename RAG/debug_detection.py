import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

# Test specialization detection
query = "give me a lawyer detail for the civil section"
query_lower = query.lower()

# Check if lawyer query
lawyer_keywords = ['lawyer', 'advocate', 'attorney', 'counsel', 'legal professional']
is_lawyer = any(keyword in query_lower for keyword in lawyer_keywords)
print(f"Is lawyer query: {is_lawyer}")

# Extract specialization
specializations = {
    'civil': ['civil', 'civil section'],
    'criminal': ['criminal'],
}

specialization = None
for spec, keywords in specializations.items():
    if any(kw in query_lower for kw in keywords):
        specialization = spec
        print(f"Detected specialization: {specialization}")
        break

if not specialization:
    print("No specialization detected!")
else:
    # Test keyword search
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    search_term = f"%{specialization.title()} Law%"
    print(f"\nSearching for: {search_term}")
    
    cursor.execute("""
        SELECT 
            id,
            content,
            metadata
        FROM documents
        WHERE content LIKE %s
        AND metadata->>'source' = 'Lawyer.pdf'
        LIMIT 5
    """, (search_term,))
    
    results = cursor.fetchall()
    print(f"Found {len(results)} results\n")
    
    for i, row in enumerate(results, 1):
        print(f"[{i}] {row['content'][:200]}")
        print()
    
    conn.close()
