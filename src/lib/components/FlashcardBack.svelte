<script lang="ts">
    import type { Card } from "$lib/types";
    import TranslationControls from "./TranslationControls.svelte";

    export let card: Card;
    export let isSpeaking: boolean;
    export let speak: (text: string) => void;
    export let updateProgress: (progress: number) => void;
    export let hideAnswer: () => void;

    export let selectedLanguage: string;
    export let translatedTextBack: string;
    export let translationErrorBack: string;
    export let isTranslatingBack: boolean;
    export let translateText: (text: string, isFront: boolean) => void;
</script>

<div class="flashcard-back">
    <h2>Answer</h2>
    <p>{card.back}</p>

    <div class="card-actions">
        <button
            class="icon-action"
            on:click={() => speak(card.back)}
            disabled={isSpeaking}
        >
            {isSpeaking ? "🔊 Speaking..." : "🔊 Speak"}
        </button>

        <TranslationControls
            {selectedLanguage}
            translatedText={translatedTextBack}
            translationError={translationErrorBack}
            isTranslating={isTranslatingBack}
            onTranslate={() => translateText(card.back, false)}
            onSpeakTranslation={() => speak(translatedTextBack)}
            {isSpeaking}
        />
    </div>

    <div class="rating">
        <h3>How well did you know this?</h3>
        <div class="rating-buttons">
            <button class="rating-btn poor" on:click={() => updateProgress(0)}>
                0% (Not at all)
            </button>
            <button class="rating-btn fair" on:click={() => updateProgress(25)}>
                25% (Slightly)
            </button>
            <button class="rating-btn good" on:click={() => updateProgress(50)}>
                50% (Moderately)
            </button>
            <button
                class="rating-btn very-good"
                on:click={() => updateProgress(75)}
            >
                75% (Mostly)
            </button>
            <button
                class="rating-btn excellent"
                on:click={() => updateProgress(100)}
            >
                100% (Perfectly)
            </button>
        </div>
    </div>

    <!-- Hide Answer Button -->
    <div class="hide-answer">
        <button on:click={hideAnswer}>Hide Answer</button>
    </div>
</div>

<style lang="scss">
    @use "sass:color";

    .flashcard-back {
        margin-top: 2rem;
        padding: 1.5rem;
        background-color: var(--card-background);
        border: 1px solid var(--card-border);
        border-radius: 8px;
        box-shadow: var(--shadow);

        h2 {
            font-size: 1.5rem;
            margin-top: 0;
            margin-bottom: 1rem;
            color: var(--secondary-color);
        }

        p {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }

        .card-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1.5rem;

            button {
                flex: 1 1 auto;
                white-space: nowrap;
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

        .rating {
            margin-top: 2rem;

            h3 {
                font-size: 1.1rem;
                margin-top: 0;
                margin-bottom: 1rem;
            }

            .rating-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;

                .rating-btn {
                    flex: 1 1 45%;
                    padding: 0.75rem 0.5rem;
                    font-size: 0.875rem;
                    border: none;
                    border-radius: 4px;
                    color: white;
                    cursor: pointer;

                    &.poor {
                        background-color: var(--error-color);
                    }

                    &.fair {
                        background-color: var(--warning-color);
                    }

                    &.good {
                        background-color: var(--primary-color);
                    }

                    &.very-good {
                        background-color: var(--accent-color);
                    }

                    &.excellent {
                        background-color: var(--success-color);
                    }

                    &:hover {
                        opacity: 0.9;
                    }
                }
            }
        }

        .hide-answer {
            display: flex;
            justify-content: center;
            margin-top: 2rem;

            button {
                padding: 0.75rem 2rem;
                font-size: 1.1rem;
                border: none;
                border-radius: 4px;
                background-color: var(--primary-color);
                color: white;
                cursor: pointer;

                &:hover {
                    background-color: color.adjust(#3a86ff, $lightness: -10%);
                }
            }
        }
    }
</style>
