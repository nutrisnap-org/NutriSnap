from flask import Flask, request, jsonify
import google.generativeai as genai  
import requests  

app = Flask(__name__)

@app.route('/process-image', methods=['POST'])
def process_image():
    image_url = request.json.get('imageUrl')

  
    response = requests.get(image_url)
    if response.status_code == 200:
        image_content = response.content

        
        model = genai.GenerativeModel('gemini-pro-vision')

        gemini_response = model.generate_content(image_content)

        processed_content = to_markdown(gemini_response.text)

        return jsonify({"processedContent": processed_content})
    else:
        return 'Failed to fetch image', 400

def to_markdown(text):
    return f"```markdown\n{text}\n```"

if __name__ == '__main__':
    app.run(debug=True)
