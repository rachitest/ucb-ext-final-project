import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Deck, Card } from '$lib/types';

// Initialize with default values
const defaultState: AppState = {
    decks: [],
    theme: 'light'
};

// Create the store
function createAppStore() {
    // Load from localStorage if available
    const initialState = browser
        ? JSON.parse(localStorage.getItem('flashcard-app-state') || JSON.stringify(defaultState))
        : defaultState;

    // Parse date strings back to Date objects
    if (initialState.decks) {
        initialState.decks.forEach((deck: Deck) => {
            deck.created = new Date(deck.created);
            deck.lastModified = new Date(deck.lastModified);
            deck.cards.forEach((card: Card) => {
                if (card.lastStudied) {
                    card.lastStudied = new Date(card.lastStudied);
                }
            });
        });
    }

    const { subscribe, set, update } = writable<AppState>(initialState);

    // Save to localStorage whenever the state changes
    if (browser) {
        subscribe(state => {
            localStorage.setItem('flashcard-app-state', JSON.stringify(state));
        });
    }

    return {
        subscribe,

        // Theme actions
        toggleTheme: () => update(state => ({
            ...state,
            theme: state.theme === 'light' ? 'dark' : 'light'
        })),

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
            return {
                ...state,
                decks: [...state.decks, newDeck]
            };
        }),

        updateDeck: (id: string, updates: Partial<Deck>) => update(state => {
            const deckIndex = state.decks.findIndex(d => d.id === id);
            if (deckIndex === -1) return state;

            const updatedDeck = {
                ...state.decks[deckIndex],
                ...updates,
                lastModified: new Date()
            };

            const decks = [...state.decks];
            decks[deckIndex] = updatedDeck;

            return { ...state, decks };
        }),

        deleteDeck: (id: string) => update(state => ({
            ...state,
            decks: state.decks.filter(deck => deck.id !== id)
        })),

        // Card actions
        addCard: (deckId: string, front: string, back: string) => update(state => {
            const deckIndex = state.decks.findIndex(d => d.id === deckId);
            if (deckIndex === -1) return state;

            const newCard: Card = {
                id: uuidv4(),
                front,
                back,
                progress: 0,
                lastStudied: null
            };

            const deck = { ...state.decks[deckIndex] };
            deck.cards = [...deck.cards, newCard];
            deck.lastModified = new Date();

            // Recalculate total progress
            deck.totalProgress = deck.cards.length > 0
                ? deck.cards.reduce((sum, card) => sum + card.progress, 0) / deck.cards.length
                : 0;

            const decks = [...state.decks];
            decks[deckIndex] = deck;

            return { ...state, decks };
        }),

        updateCard: (deckId: string, cardId: string, updates: Partial<Card>) => update(state => {
            const deckIndex = state.decks.findIndex(d => d.id === deckId);
            if (deckIndex === -1) return state;

            const cardIndex = state.decks[deckIndex].cards.findIndex(c => c.id === cardId);
            if (cardIndex === -1) return state;

            const deck = { ...state.decks[deckIndex] };
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

            const decks = [...state.decks];
            decks[deckIndex] = deck;

            return { ...state, decks };
        }),

        deleteCard: (deckId: string, cardId: string) => update(state => {
            const deckIndex = state.decks.findIndex(d => d.id === deckId);
            if (deckIndex === -1) return state;

            const deck = { ...state.decks[deckIndex] };
            deck.cards = deck.cards.filter(card => card.id !== cardId);
            deck.lastModified = new Date();

            // Recalculate total progress
            deck.totalProgress = deck.cards.length > 0
                ? deck.cards.reduce((sum, card) => sum + card.progress, 0) / deck.cards.length
                : 0;

            const decks = [...state.decks];
            decks[deckIndex] = deck;

            return { ...state, decks };
        })
    };
}

export const appStore = createAppStore();

// Create derived stores for convenience
export const theme = derived(appStore, $appStore => $appStore.theme);
export const decks = derived(appStore, $appStore => $appStore.decks);