// src/routes/api/translate/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
    return json({ message: 'Hello from the server!' });
};