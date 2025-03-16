import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { text, targetLang } = await request.json();

        if (!text) {
            return json({ error: 'No text provided' }, { status: 400 });
        }

        if (!targetLang) {
            return json({ error: 'No target language provided' }, { status: 400 });
        }

        const apiKey = env.AZURE_TRANSLATOR_KEY;

        if (!apiKey) {
            console.error('No Azure Translator API key found in environment variables');
            return json({ error: 'Azure Translator API key not configured' }, { status: 500 });
        }

        const region = env.AZURE_TRANSLATOR_REGION || 'global'; // Default to 'global' if region is not set

        const response = await fetch(
            `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${targetLang}`,
            {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': apiKey,
                    'Ocp-Apim-Subscription-Region': region,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{ text }])
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Azure Translator API Error Status:", response.status);
            console.error("Azure Translator API Error Response:", errorText);

            let errorMessage = 'Translation failed';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error?.message || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }

            return json({ error: errorMessage }, { status: response.status });
        }

        const data = await response.json();
        const translatedText = data[0].translations[0].text;

        return json({ translatedText });
    } catch (error) {
        console.error('Translation error:', error);
        return json({ error: 'Failed to translate text' }, { status: 500 });
    }
};