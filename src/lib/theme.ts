import { browser } from '$app/environment';
import { theme } from '$lib/stores/appStore';

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
    // Remove the # if present
    hex = hex.replace(/^#/, '');

    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
}

// Apply theme to the document
export function initializeTheme() {
    if (!browser) return;

    theme.subscribe(value => {
        document.documentElement.setAttribute('data-theme', value);

        // Set RGB variables for background colors
        const primaryColor = value === 'light' ? '#3a86ff' : '#5b9fff';
        const errorColor = value === 'light' ? '#ff3b30' : '#ff453a';

        document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(primaryColor));
        document.documentElement.style.setProperty('--error-color-rgb', hexToRgb(errorColor));
    });
}