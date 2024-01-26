from flask import Flask, request, jsonify
import google.generativeai as genai  
import requests  
import os
from dotenv import load_dotenv
from PIL import Image
import requests
from io import BytesIO

load_dotenv()
GOOGLE_API_KEY=os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)


@app.route('/skin-analyse', methods=['GET'])
def generate_content():
   
    img_url = request.args.get('img_url')

    if img_url:
        
        response = requests.get(img_url)

        
        if response.status_code == 200:
          
            image = Image.open(BytesIO(response.content))

           
            model = genai.GenerativeModel('gemini-pro-vision')

            response = model.generate_content(["Analyse the skin of this human and suggest any remedies if necessary eg in this format {'status':'healthy' ,'description':'The skin appears to be healthy and clear', 'remedies':'However, the person may want to consider using a moisturizer to keep their skin hydrated, especially if they live in a dry climate. Additionally, the person may want to consider using a sunscreen with an SPF of 30 or higher to protect their skin from the sun's harmful UV rays.'}", image], stream=True)
            response.resolve()

           
            return jsonify({"result": response.text})
        else:
            return jsonify({"error": "Failed to retrieve the image"}), 400
    else:
        return jsonify({"error": "img_url parameter is required"}), 400


if __name__ == '__main__':
    app.run(debug=True)

