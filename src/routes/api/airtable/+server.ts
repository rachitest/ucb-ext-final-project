import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserData, saveUserData } from '$lib/server/airtable'; // Import from server-only module
import type { AppState } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { type, userId, appState } = await request.json() as {
            type: 'get' | 'save';
            userId: string;
            appState?: AppState; // Only needed for 'save'
        };

        if (!userId) {
            return json({ error: 'Missing userId' }, { status: 400 });
        }

        if (type === 'get') {
            const data = await getUserData(userId);
            return json({ data });
        } else if (type === 'save') {
            if (!appState) {
                return json({ error: 'Missing appState' }, { status: 400 });
            }
            await saveUserData(userId, appState);
            return json({ success: true });
        } else {
            return json({ error: 'Invalid request type' }, { status: 400 });
        }
    } catch (error) {
        console.error('Airtable API error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};