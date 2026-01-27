import requests
import json
import sys

def test_rag_system():
    """Test the RAG system with sample queries"""
    
    RAG_API_URL = "http://localhost:8000"
    
    print("🧪 Testing RAG System\n")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing Health Check...")
    try:
        response = requests.get(f"{RAG_API_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health check passed")
            print(f"  Status: {data['status']}")
            print(f"  Database: {data['database']}")
            print(f"  Documents: {data['documents_count']}")
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to RAG API")
        print("  Make sure the Python server is running: python app.py")
        return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False
    
    # Test 2: Sample queries
    test_queries = [
        "How do I report a cybercrime in India?",
        "What is the IT Act 2000?",
        "How to file a complaint on cybercrime portal?"
    ]
    
    print("\n2. Testing Query Functionality...")
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n  Query {i}: {query}")
        try:
            response = requests.post(
                f"{RAG_API_URL}/query",
                json={"query": query, "max_results": 3},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                answer = data['answer']
                sources = data['sources']
                
                print(f"  ✓ Got response ({len(answer)} chars)")
                print(f"  ✓ Found {len(sources)} relevant sources")
                print(f"\n  Answer preview: {answer[:150]}...")
                
                if sources:
                    print(f"\n  Top source:")
                    print(f"    - {sources[0]['source']} (Page {sources[0]['page']})")
                    print(f"    - Relevance: {sources[0]['similarity']:.2%}")
            else:
                print(f"  ✗ Query failed: {response.status_code}")
                print(f"    {response.text}")
                
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✓ Testing completed!")
    print("\nNext steps:")
    print("  1. Start Node.js backend: cd server && node app.js")
    print("  2. Start React frontend: cd client && npm run dev")
    print("  3. Open http://localhost:5173 and click 'Start Chatting'")
    
    return True

if __name__ == "__main__":
    success = test_rag_system()
    sys.exit(0 if success else 1)
