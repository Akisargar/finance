import axios from 'axios';

// Function to chunk the array
function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

// Function to send chunk to ChatGPT
async function sendChunkToChatGPT(chunk, prompt, apiKey) {
    const message = `Here is a part of the transcript: ${chunk.join(" ")}. ${prompt}`;

    const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: message }
        ]
    };

    while (true) {
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            return response.data.choices[0].message.content;

        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                const errorCode = error.response.data.error.code;
                const errorMessage = error.response.data.error.message;

                if (errorCode === 'rate_limit_exceeded') {
                    const retryAfter = parseInt(error.response.headers['retry-after'] || 5, 10) * 1000;
                    console.warn(`Rate limit exceeded. Retrying after ${retryAfter / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, retryAfter));
                } else if (errorCode === 'context_length_exceeded') {
                    throw new Error(`Context length exceeded. Unable to process the request.`);
                } else {
                    throw new Error(`Error from ChatGPT: ${errorMessage}`);
                }
            } else {
                throw new Error(`Error sending request to ChatGPT: ${error.message}`);
            }
        }
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { array, prompt } = req.body;

    if (!array || !prompt) {
        return res.status(400).json({ error: 'Array and prompt are required' });
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY; // Use environment variable for API key
        const chunkSize = 55000; // Adjust based on the token limit
        const chunks = chunkArray(array, chunkSize);
        let combinedResponse = "";

        for (const chunk of chunks) {
            const response = await sendChunkToChatGPT(chunk, prompt, apiKey);
            combinedResponse += response + " ";
        }

        res.json({ response: combinedResponse.trim() });
    } catch (error) {
        console.error('Error sending request to ChatGPT:', error.message);
        res.status(500).json({ error: 'Failed to get response from ChatGPT' });
    }
}
