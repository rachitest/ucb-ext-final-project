<script lang="ts">
    import { languages } from "$lib/languages";

    export let selectedLanguage: string; // No change needed, already correct
    export let translatedText: string;
    export let translationError: string;
    export let isTranslating: boolean;
    export let onTranslate: () => void;
    export let onSpeakTranslation: () => void;
    export let isSpeaking: boolean;
</script>

<div class="translation-container">
    <div class="translation-controls">
        <select bind:value={selectedLanguage}>
            {#each languages as lang}
                <option value={lang.code}>{lang.name}</option>
            {/each}
        </select>
        <button on:click={onTranslate} disabled={isTranslating}>
            {isTranslating ? "Translating..." : "Translate"}
        </button>
    </div>

    {#if translatedText}
        <div class="translation-result">
            <p>{translatedText}</p>
            <button
                class="icon-action"
                on:click={onSpeakTranslation}
                disabled={isSpeaking}
            >
                {isSpeaking ? "🔊 Speaking..." : "🔊 Speak Translation"}
            </button>
        </div>
    {:else if translationError}
        <div class="translation-error">
            <p>Error: {translationError}</p>
        </div>
    {/if}
</div>

<style lang="scss">
    @use "sass:color";

    .translation-container {
        margin-top: 1rem;
        width: 100%;
        min-width: 0; // added
        overflow-wrap: anywhere; //added

        .translation-controls {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            flex-wrap: wrap; // Added to handle wrapping on small screens

            select {
                flex: 1;
                max-width: 70%; // Add max-width for smaller screens
                padding: 0.5rem;
                border: 1px solid var(--card-border);
                border-radius: 4px;
                background-color: var(--card-background);
                color: var(--text-color);
                font-size: 0.9rem;
            }

            button {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 4px;
                background-color: var(--primary-color);
                color: white;
                font-size: 0.9rem;
                cursor: pointer;
                white-space: nowrap; // Prevent button text from wrapping

                &:hover {
                    background-color: color.adjust(#3a86ff, $lightness: -10%);
                }

                &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            }
        }

        .translation-result {
            padding: 1rem;
            background-color: rgba(var(--primary-color-rgb), 0.1);
            border-radius: 4px;

            p {
                margin: 0;
                font-size: 1rem;
            }

            .icon-action {
                background: none;
                color: var(--primary-color);
                border: 1px solid var(--primary-color);
                padding: 0.5rem 1rem;
                border-radius: 4px;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
                cursor: pointer;

                &:hover:not(:disabled) {
                    background-color: var(--primary-color);
                    color: white;
                }

                &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            }
        }

        .translation-error {
            padding: 1rem;
            background-color: rgba(var(--error-color-rgb), 0.1);
            border-radius: 4px;
            color: var(--error-color);

            p {
                margin: 0;
                font-size: 1rem;
            }
        }
    }
</style>
