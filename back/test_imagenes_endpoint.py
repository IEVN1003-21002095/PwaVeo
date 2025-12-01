"""
Script para probar el endpoint de imágenes
"""
import requests
import json

def test_get_images(product_id=2):
    url = f"http://localhost:5000/api/product/{product_id}/images"
    
    print(f"🔍 Probando GET {url}")
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Respuesta exitosa:")
            print(f"   Success: {data.get('success')}")
            print(f"   Datos: {len(data.get('data', []))} imágenes")
            
            if data.get('data'):
                for i, img in enumerate(data['data']):
                    print(f"\n   Imagen {i+1}:")
                    print(f"     ID: {img.get('id')}")
                    print(f"     Producto ID: {img.get('producto_id')}")
                    print(f"     Es Principal: {img.get('es_principal')}")
                    print(f"     Color: {img.get('color_nombre')}")
                    preview = str(img.get('imagen_data', ''))[:100]
                    print(f"     Preview Data: {preview}...")
        else:
            print(f"❌ Error {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Excepción: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("="*60)
    print("TEST: Endpoint de imágenes de productos")
    print("="*60)
    test_get_images(2)
    print("="*60)
