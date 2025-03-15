import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private'; // Changed from public to private

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { text, targetLang } = await request.json();

        if (!text) {
            return json({ error: 'No text provided' }, { status: 400 });
        }

        if (!targetLang) {
            return json({ error: 'No target language provided' }, { status: 400 });
        }

        // Try multiple potential environment variable names
        const apiKey = env.DEEPL_API_KEY || env.DEEPL_KEY || env.PUBLIC_DEEPL_KEY;

        if (!apiKey) {
            console.error('No DeepL API key found in environment variables');
            return json({ error: 'DeepL API key not configured' }, { status: 500 });
        }

        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: [text],
                target_lang: targetLang
            })
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get response as text first
            console.error("DeepL API Error Status:", response.status);
            console.error("DeepL API Error Response:", errorText);

            let errorMessage = 'Translation failed';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // If parsing fails, use the text as is
                errorMessage = errorText || errorMessage;
            }

            return json({ error: errorMessage }, { status: response.status });
        }

        const data = await response.json();
        const translatedText = data.translations[0].text;

        return json({ translatedText });
    } catch (error) {
        console.error('Translation error:', error);
        return json({ error: 'Failed to translate text' }, { status: 500 });
    }
};