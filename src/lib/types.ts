export interface Card {
    id: string;
    front: string;
    back: string;
    progress: number; // 0-100 indicating progress
    lastStudied: Date | null;
}

export interface Deck {
    id: string;
    name: string;
    description: string;
    cards: Card[];
    created: Date;
    lastModified: Date;
    totalProgress: number; // Calculated based on card progress
}

export interface AppState {
    decks: Deck[];
    theme: 'light' | 'dark';
}