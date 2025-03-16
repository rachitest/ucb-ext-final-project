import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Deck, Card } from '$lib/types';

// --- Generate or Retrieve User ID ---
let userId: string;

if (browser) {
    userId = localStorage.getItem('flashcard-app-user-id') || uuidv4();
    localStorage.setItem('flashcard-app-user-id', userId);
} else {
    userId = 'server-user'; // Placeholder for SSR (important for SvelteKit)
}

// --- Load Initial State (from Airtable via API) ---
async function loadInitialState(): Promise<AppState> {
    if (browser) {
        const response = await fetch('/api/airtable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'get', userId }),
        });

        if (response.ok) {
            const { data } = await response.json();
            if (data) {
                return data;
            }
        }
    }

    // Default state if no data is found (or during SSR)
    return {
        decks: [],
        theme: 'light',
    };
}

// Add a loading state
interface AppStoreState {
    loading: boolean;
    data: AppState;
}

// Create the store
function createAppStore() {
    const { subscribe, set, update } = writable<AppStoreState>(
        { loading: true, data: { decks: [], theme: 'light' } }, // Initial value
    );

    if (browser) {
        loadInitialState().then(initialState => {
            set({ loading: false, data: initialState });
        });
    }

    return {
        subscribe,

        // Theme actions
        toggleTheme: () => update(state => {
            const newData: AppState = {
                ...state.data,
                theme: state.data.theme === 'light' ? 'dark' : 'light'
            };
            if (browser) {
                fetch('/api/airtable', { // Call the API to save
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type: 'save', userId, appState: newData }),
                });
            }
            return { ...state, data: newData };
        }),

        // Deck actions
        addDeck: (name: string, description: string) => update(state => {
            const newDeck: Deck = {
                id: uuidv4(),
                name,
                description,
                cards: [],
                created: new Date(),
                lastModified: new Date(),
                totalProgress: 0
            };
            const newData: AppState = {
                ...state.data,
                decks: [...state.data.decks, newDeck]
            };

            if (browser) {
                fetch('/api/airtable', { // Call the API to save
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type: 'save', userId, appState: newData }),
                });
            }
            return { ...state, data: newData };
        }),

        updateDeck: (id: string, updates: Partial<Deck>) => update(state => {
            const deckIndex = state.data.decks.findIndex(d => d.id === id);
            if (deckIndex === -1) return state;

            const updatedDeck = {
                ...state.data.decks[deckIndex],
                ...updates,
                lastModified: new Date()
            };

            const decks = [...state.data.decks];
            decks[deckIndex] = updatedDeck;
            const newData: AppState = { ...state.data, decks };

            if (browser) {
                fetch('/api/airtable', { // Call the API to save
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type: 'save', userId, appState: newData }),
                });
            }
            return { ...state, data: newData };
        }),

        deleteDeck: (id: string) => update(state => {
            const newData: AppState = {
                ...state.data,
                decks: state.data.decks.filter(deck => deck.id !== id)
            };
            if (browser) {
                fetch('/api/airtable', { // Call the API to save
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type: 'save', userId, appState: newData }),
                });
            }
            return { ...state, data: newData };
        }),

        // Card actions
        addCard: (deckId: string, front: string, back: string) => update(state => {
            const deckIndex = state.data.decks.findIndex(d => d.id === deckId);
            if (deckIndex === -1) return state;

            const newCard: Card = {
                id: uuidv4(),
                front,
                back,
                progress: 0,
                lastStudied: null
            };

            const deck = { ...state.data.decks[deckIndex] };
            deck.cards = [...deck.cards, newCard];
            deck.lastModified = new Date();

            // Recalculate total progress
            deck.totalProgress = deck.cards.length > 0
                ? deck.cards.reduce((sum, card) => sum + card.progress, 0) / deck.cards.length
                : 0;

            const decks = [...state.data.decks];
            decks[deckIndex] = deck;

            const newData: AppState = { ...state.data, decks };
            if (browser) {
                fetch('/api/airtable', { // Call the API to save
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type: 'save', userId, appState: newData }),
                });
            }
            return { ...state, data: newData };
        }),

        updateCard: (deckId: string, cardId: string, updates: Partial<Card>) => update(state => {
            const deckIndex = state.data.decks.findIndex(d => d.id === deckId);
            if (deckIndex === -1) return state;

            const cardIndex = state.data.decks[deckIndex].cards.findIndex(c => c.id === cardId);
            if (cardIndex === -1) return state;

            const deck = { ...state.data.decks[deckIndex] };
            const cards = [...deck.cards];

            cards[cardIndex] = {
                ...cards[cardIndex],
                ...updates,
                lastStudied: updates.progress !== undefined ? new Date() : cards[cardIndex].lastStudied
            };

            deck.cards = cards;
            deck.lastModified = new Date();

            // Recalculate total progress
            deck.totalProgress = deck.cards.length > 0
                ? deck.cards.reduce((sum, card) => sum + card.progress, 0) / deck.cards.length
                : 0;

            const decks = [...state.data.decks];
            decks[deckIndex] = deck;
            const newData: AppState = { ...state.data, decks };
            if (browser) {
                fetch('/api/airtable', { // Call the API to save
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type: 'save', userId, appState: newData }),
                });
            }
            return { ...state, data: newData };
        }),

        deleteCard: (deckId: string, cardId: string) => update(state => {
            const deckIndex = state.data.decks.findIndex(d => d.id === deckId);
            if (deckIndex === -1) return state;

            const deck = { ...state.data.decks[deckIndex] };
            deck.cards = deck.cards.filter(card => card.id !== cardId);
            deck.lastModified = new Date();

            // Recalculate total progress
            deck.totalProgress = deck.cards.length > 0
                ? deck.cards.reduce((sum, card) => sum + card.progress, 0) / deck.cards.length
                : 0;

            const decks = [...state.data.decks];
            decks[deckIndex] = deck;
            const newData: AppState = { ...state.data, decks };

            if (browser) {
                fetch('/api/airtable', { // Call the API to save
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type: 'save', userId, appState: newData }),
                });
            }
            return { ...state, data: newData };
        })
    };
}

export const appStore = createAppStore();

// Update derived stores
export const theme = derived(appStore, $appStore => $appStore.data.theme);
export const decks = derived(appStore, $appStore => $appStore.data.decks);