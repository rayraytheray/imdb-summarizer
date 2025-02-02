import google.generativeai as genai
import os
from dotenv import load_dotenv

def summarize_comments(comments):
    """
    Generate a summary of the given comments using Google's Gemini Pro
    """
    try:
        # Configure the Gemini API
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        
        # Create the model
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Combine all comments into a single string
        comments_text = "\n".join(f"- {comment}" for comment in comments)
        
        # Create the prompt
        prompt = f"""Please summarize the key themes and sentiment from these comments with a 1-3 sentence reply as if you would reply back to the reel to a friend, with slang:

{comments_text}
"""
 # Summarize the main points from these Instagram comments in a casual, engaging way"""
 #Provide a concise, natural-sounding summary that captures the main points and overall tone."""

        # Generate the summary
        response = model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def main():
    # Load environment variables
    load_dotenv()
    
    # Sample comments (you can replace these with your own)
    sample_comments = [
        "What is the meaning of this pointless song",
        "YEAAAHH BABY🗣️💯🦅🔥",
        "Literally me wit my JBL party box in my backseat",
        "That is so awesome",
        "That's 7 in a row.",
        "Bro I was looking through my notes and I found the song in a note titled 'Listen to later' it's the first one 😭😭",
        "WMy ICE agent prolly heard me play this song one time and figured I need to see this",
        "Buy $JBL",
        "BRO THIS MY 15th fetty meme",
        "75th fetty meme"
    ]
    
    print("\nOriginal Comments:")
    print("-" * 50)
    for i, comment in enumerate(sample_comments, 1):
        print(f"{i}. {comment}")
    
    print("\nGenerating Summary...")
    print("-" * 50)
    summary = summarize_comments(sample_comments)
    print("\nSummary:")
    print("-" * 50)
    print(summary)

if __name__ == "__main__":
    main()