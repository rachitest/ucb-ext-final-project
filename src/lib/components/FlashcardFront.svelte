<script lang="ts">
    import TranslationControls from "./TranslationControls.svelte";
    import type { Card } from "$lib/types";

    export let card: Card;
    export let isSpeaking: boolean;
    export let selectedLanguage: string;
    export let translatedTextFront: string;
    export let translationErrorFront: string;
    export let isTranslatingFront: boolean;
    export let speak: (text: string) => void;
    export let translateText: (text: string, isFront: boolean) => void;
</script>

<div class="flashcard-front">
    <h2>Question</h2>
    <p>{card.front}</p>

    <div class="card-actions">
        <button
            class="icon-action"
            on:click={() => speak(card.front)}
            disabled={isSpeaking}
        >
            {isSpeaking ? "🔊 Speaking..." : "🔊 Speak"}
        </button>

        <TranslationControls
            {selectedLanguage}
            translatedText={translatedTextFront}
            translationError={translationErrorFront}
            isTranslating={isTranslatingFront}
            onTranslate={() => translateText(card.front, true)}
            onSpeakTranslation={() => speak(translatedTextFront)}
            {isSpeaking}
        />
    </div>
</div>

<style lang="scss">
    .flashcard-front {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background-color: var(--card-background);
        border: 1px solid var(--card-border);
        border-radius: 8px;
        box-shadow: var(--shadow);

        h2 {
            font-size: 1.5rem;
            margin-top: 0;
            margin-bottom: 1rem;
            color: var(--primary-color);
        }

        p {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }

        .card-actions {
            display: flex;
            flex-wrap: wrap; /* Allow buttons to wrap on smaller screens */
            gap: 0.5rem;
            margin-bottom: 1.5rem;

            button {
                flex: 1 1 auto; /* Allow buttons to grow and shrink */
                white-space: nowrap;
                min-width: 120px; /* Set a minimum width for buttons */
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
    }

    /* Responsive adjustments for mobile */
    @media (max-width: 768px) {
        .flashcard-front {
            padding: 1rem;

            .card-actions {
                flex-direction: column; /* Stack buttons vertically on mobile */
                gap: 0.5rem;

                button {
                    width: 100%; /* Full width buttons on mobile */
                }
            }
        }
    }
</style>
