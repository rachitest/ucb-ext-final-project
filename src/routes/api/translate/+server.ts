import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
    try {
        const { text, targetLang } = await request.json();

        if (!text) {
            return json({ error: 'No text provided' }, { status: 400 });
        }

        if (!targetLang) {
            return json({ error: 'No target language provided' }, { status: 400 });
        }

        const apiKey = env.PUBLIC_DEEPL_KEY;

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
            return json({ error: errorData.message || 'Translation failed' }, { status: response.status });
        }

        const data = await response.json();
        const translatedText = data.translations[0].text;

        return json({ translatedText });
    } catch (error) {
        console.error('Translation error:', error);
        return json({ error: 'Failed to translate text' }, { status: 500 });
    }
};