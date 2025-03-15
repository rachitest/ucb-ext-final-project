import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { text, targetLang } = await request.json();

        if (!text) {
            return json({ error: 'No text provided' }, { status: 400 });
        }

        if (!targetLang) {
            return json({ error: 'No target language provided' }, { status: 400 });
        }

        const apiKey = env.PUBLIC_DEEPL_KEY;
        console.log("DeepL API Key:", apiKey); // Log the API key

        if (!apiKey) {
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
            const errorData = await response.json();
            console.error("DeepL API Error:", errorData); // Log the error
            return json({ error: errorData.message || 'Translation failed' }, { status: response.status });
        }

        const data = await response.json();
        console.log("DeepL API Response:", data); // Log the response
        const translatedText = data.translations[0].text;

        return json({ translatedText });
    } catch (error) {
        console.error('Translation error:', error);
        return json({ error: 'Failed to translate text' }, { status: 500 });
    }
};