require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to create a system prompt for syllabus summarization
const createSyllabusPrompt = (syllabus) => {
    return `Please analyze and summarize the following course syllabus. Focus on:
    - Course objectives and learning outcomes
    - Main topics covered
    - Assessment methods
    - Key deadlines
    - Required materials
    
    Here's the syllabus:
    ${syllabus}`;
};

// Main function to summarize syllabus
async function summarizeSyllabus(syllabusText) {
    try {
        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create the prompt
        const prompt = createSyllabusPrompt(syllabusText);

        // Generate the response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error in Gemini API call:', error);
        throw new Error('Failed to generate syllabus summary');
    }
}

async function analyzeReviews(reviews) {
    try {
        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analyze these movie reviews and provide:
1. Overall sentiment analysis
2. Common themes or patterns
3. Main criticisms and praise points

Reviews:
${reviews.join('\n\n')}`;

        // Generate the response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error in Gemini API call:', error);
        throw new Error('Failed to analyze reviews');
    }
}

// Export the function to be used by other files
module.exports = {
    summarizeSyllabus, 
    analyzeReviews
};