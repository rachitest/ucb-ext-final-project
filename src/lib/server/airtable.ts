import Airtable from 'airtable';
import { env } from '$env/dynamic/private';
import type { AppState, Deck } from '$lib/types';

// Configure Airtable (This is now server-only)
Airtable.configure({
    apiKey: env.AIRTABLE_PAT,
});

const base = Airtable.base(env.AIRTABLE_BASE_ID || '');
const userDecksTable = base('UserDecks');

// Get user data from Airtable
export async function getUserData(userId: string): Promise<AppState | null> {
    try {
        const records = await userDecksTable
            .select({
                filterByFormula: `{UserID} = '${userId}'`,
                maxRecords: 1,
            })
            .firstPage();

        if (records.length > 0) {
            if (records.length > 1) {
                console.warn(`Multiple records found for UserID ${userId}. Using the first one.`);
            }
            const record = records[0];
            const decksString = record.get('Decks') as string | undefined;
            const theme = record.get('Theme') as 'light' | 'dark' | undefined;

            let decks: Deck[] = [];
            if (decksString) {
                try {
                    decks = JSON.parse(decksString);
                    // Convert date strings back to Date objects
                    decks.forEach(deck => {
                        deck.created = new Date(deck.created);
                        deck.lastModified = new Date(deck.lastModified);
                        deck.cards.forEach(card => {
                            if (card.lastStudied) {
                                card.lastStudied = new Date(card.lastStudied);
                            }
                        });
                    });
                } catch (parseError) {
                    console.error('Error parsing decks JSON:', parseError);
                    return null;
                }
            }
            return {
                decks: decks,
                theme: theme || 'light',
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching data from Airtable:', error);
        return null;
    }
}

// Save user data to Airtable
export async function saveUserData(userId: string, appState: AppState): Promise<void> {
    try {
        const records = await userDecksTable
            .select({
                filterByFormula: `{UserID} = '${userId}'`,
                maxRecords: 1,
            })
            .firstPage();

        const dataToSave = {
            UserID: userId,
            Decks: JSON.stringify(appState.decks),
            Theme: appState.theme,
        };

        if (records.length > 0) {
            // Update existing record
            await userDecksTable.update(records[0].id, dataToSave);
        } else {
            // Create new record
            await userDecksTable.create(dataToSave);
        }
    } catch (error) {
        console.error('Error saving data to Airtable:', error);
        //  Handle errors appropriately (e.g., return an error code)
    }
}