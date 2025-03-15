<script lang="ts">
  import { page } from "$app/stores";
  import { decks, appStore } from "$lib/stores/appStore";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import type { Card } from "$lib/types";

  const deckId = $page.params.id;
  let deck = $decks.find((d) => d.id === deckId);

  let currentCardIndex = 0;
  let showAnswer = false;
  let isSpeaking = false;
  let isTranslating = false;
  let translatedText = "";
  let selectedLanguage = "es"; // Default to Spanish
  let translationError = "";

  // Available languages for DeepL translation
  const languages = [
    { code: "BG", name: "Bulgarian" },
    { code: "CS", name: "Czech" },
    { code: "DA", name: "Danish" },
    { code: "DE", name: "German" },
    { code: "EL", name: "Greek" },
    { code: "EN-GB", name: "English (British)" },
    { code: "EN-US", name: "English (American)" },
    { code: "ES", name: "Spanish" },
    { code: "ET", name: "Estonian" },
    { code: "FI", name: "Finnish" },
    { code: "FR", name: "French" },
    { code: "HU", name: "Hungarian" },
    { code: "ID", name: "Indonesian" },
    { code: "IT", name: "Italian" },
    { code: "JA", name: "Japanese" },
    { code: "KO", name: "Korean" },
    { code: "LT", name: "Lithuanian" },
    { code: "LV", name: "Latvian" },
    { code: "NB", name: "Norwegian" },
    { code: "NL", name: "Dutch" },
    { code: "PL", name: "Polish" },
    { code: "PT", name: "Portuguese" },
    { code: "PT-BR", name: "Portuguese (Brazilian)" },
    { code: "RO", name: "Romanian" },
    { code: "RU", name: "Russian" },
    { code: "SK", name: "Slovak" },
    { code: "SL", name: "Slovenian" },
    { code: "SV", name: "Swedish" },
    { code: "TR", name: "Turkish" },
    { code: "UK", name: "Ukrainian" },
    { code: "ZH", name: "Chinese (simplified)" },
  ];

  $: currentCard = deck?.cards[currentCardIndex];
  $: hasNextCard = deck && currentCardIndex < deck.cards.length - 1;
  $: hasPrevCard = currentCardIndex > 0;

  onMount(() => {
    if (!deck || deck.cards.length === 0) {
      goto("/dashboard");
    }
  });

  function nextCard() {
    if (hasNextCard) {
      currentCardIndex++;
      showAnswer = false;
      translatedText = "";
      translationError = "";
    }
  }

  function prevCard() {
    if (hasPrevCard) {
      currentCardIndex--;
      showAnswer = false;
      translatedText = "";
      translationError = "";
    }
  }

  function toggleAnswer() {
    showAnswer = !showAnswer;
  }

  function updateProgress(progress: number) {
    if (!currentCard) return;

    appStore.updateCard(deckId, currentCard.id, {
      progress: progress,
    });

    // Automatically move to next card if available
    if (hasNextCard) {
      setTimeout(nextCard, 500);
    }
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      alert("Sorry, your browser does not support text-to-speech!");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => {
      isSpeaking = true;
    };

    utterance.onend = () => {
      isSpeaking = false;
    };

    utterance.onerror = () => {
      isSpeaking = false;
    };

    window.speechSynthesis.speak(utterance);
  }

  async function translateText(text: string) {
    if (!text) return;

    try {
      isTranslating = true;
      translationError = "";
      translatedText = "";

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          targetLang: selectedLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Translation failed");
      }

      const data = await response.json();
      translatedText = data.translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      translationError =
        error instanceof Error
          ? error.message
          : "Translation failed. Please try again.";
    } finally {
      isTranslating = false;
    }
  }

  function finishStudying() {
    goto(`/deck/${deckId}`);
  }
</script>

{#if deck && currentCard}
  <div class="study-view">
    <div class="study-header flex-between">
      <h1>Studying: {deck.name}</h1>
      <div class="controls">
        <div class="progress-text">
          Card {currentCardIndex + 1} of {deck.cards.length}
        </div>
        <button class="finish-btn" on:click={finishStudying}
          >Finish Studying</button
        >
      </div>
    </div>

    <div class="progress-bar overall-progress">
      <div
        class="progress"
        style="width: {((currentCardIndex + 1) / deck.cards.length) * 100}%"
      ></div>
    </div>

    <div class="flashcard-container">
      <div class="card flashcard">
        <div class="flashcard-front">
          <h2>Question</h2>
          <p>{currentCard.front}</p>

          <div class="card-actions">
            <button
              class="icon-action"
              on:click={() => speak(currentCard.front)}
              disabled={isSpeaking}
            >
              {isSpeaking ? "🔊 Speaking..." : "🔊 Speak"}
            </button>

            <div class="translation-container">
              <div class="translation-controls">
                <select bind:value={selectedLanguage}>
                  {#each languages as lang}
                    <option value={lang.code}>{lang.name}</option>
                  {/each}
                </select>
                <button
                  on:click={() => translateText(currentCard.front)}
                  disabled={isTranslating}
                >
                  {isTranslating ? "Translating..." : "Translate"}
                </button>
              </div>

              {#if translatedText}
                <div class="translation-result">
                  <p>{translatedText}</p>
                  <button
                    class="icon-action"
                    on:click={() => speak(translatedText)}
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
          </div>
        </div>

        {#if showAnswer}
          <div class="flashcard-back">
            <h2>Answer</h2>
            <p>{currentCard.back}</p>

            <div class="card-actions">
              <button
                class="icon-action"
                on:click={() => speak(currentCard.back)}
                disabled={isSpeaking}
              >
                {isSpeaking ? "🔊 Speaking..." : "🔊 Speak"}
              </button>
            </div>

            <div class="rating">
              <h3>How well did you know this?</h3>
              <div class="rating-buttons">
                <button
                  class="rating-btn poor"
                  on:click={() => updateProgress(0)}
                >
                  0% (Not at all)
                </button>
                <button
                  class="rating-btn fair"
                  on:click={() => updateProgress(25)}
                >
                  25% (Slightly)
                </button>
                <button
                  class="rating-btn good"
                  on:click={() => updateProgress(50)}
                >
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
          </div>
        {:else}
          <div class="show-answer">
            <button on:click={toggleAnswer}>Show Answer</button>
          </div>
        {/if}

        <div class="card-progress">
          <div class="progress-label flex-between">
            <span>Card Progress</span>
            <span>{Math.round(currentCard.progress)}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress" style="width: {currentCard.progress}%"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="navigation-controls flex-between">
      <button on:click={prevCard} disabled={!hasPrevCard}> ← Previous </button>
      <button on:click={nextCard} disabled={!hasNextCard}> Next → </button>
    </div>
  </div>
{:else}
  <div class="loading">Loading cards...</div>
{/if}

<style lang="scss">
  .study-view {
    max-width: 800px;
    margin: 0 auto;

    .study-header {
      margin-bottom: 1rem;

      h1 {
        margin: 0;
      }

      .controls {
        text-align: right;

        .progress-text {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .finish-btn {
          font-size: 0.9rem;
          padding: 0.35rem 0.75rem;
        }
      }
    }

    .overall-progress {
      margin-bottom: 2rem;
    }

    .flashcard-container {
      margin-bottom: 2rem;

      .flashcard {
        padding: 2rem;

        .flashcard-front {
          margin-bottom: 2rem;

          h2 {
            font-size: 1.5rem;
            margin-top: 0;
            margin-bottom: 1rem;
            color: var(--primary-color);
          }

          p {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
          }
        }

        .flashcard-back {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--card-border);

          h2 {
            font-size: 1.5rem;
            margin-top: 0;
            margin-bottom: 1rem;
            color: var(--secondary-color);
          }

          p {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
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
              justify-content: space-between;
              gap: 0.5rem;

              .rating-btn {
                flex: 1;
                padding: 0.75rem 0.5rem;

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
              }
            }
          }
        }

        .card-actions {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;

          .icon-action {
            background: none;
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
            padding: 0.5rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-right: 1rem;

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

        .translation-container {
          margin-top: 1rem;
          width: 100%;

          .translation-controls {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;

            select {
              flex: 1;
              padding: 0.5rem;
              border: 1px solid var(--card-border);
              border-radius: 4px;
              background-color: var(--card-background);
              color: var(--text-color);
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

        .show-answer {
          display: flex;
          justify-content: center;
          margin: 2rem 0;

          button {
            padding: 0.75rem 2rem;
            font-size: 1.1rem;
          }
        }
      }
    }

    .navigation-controls {
      button {
        padding: 0.75rem 1.5rem;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

  .loading {
    text-align: center;
    padding: 3rem;
    font-size: 1.25rem;
  }
</style>
