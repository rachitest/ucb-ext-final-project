<script lang="ts">
  import { page } from "$app/stores";
  import { decks, appStore } from "$lib/stores/appStore";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import type { Card } from "$lib/types";
  import { languages } from "$lib/languages";
  import TtsLanguageSelector from "$lib/components/TtsLanguageSelector.svelte";
  import FlashcardFront from "$lib/components/FlashcardFront.svelte";
  import FlashcardBack from "$lib/components/FlashcardBack.svelte";
  import ProgressBar from "$lib/components/ProgressBar.svelte";

  const deckId = $page.params.id;
  let deck = $decks.find((d) => d.id === deckId);

  let currentCardIndex = 0;
  let showAnswer = false;
  let isSpeaking = false;
  let isTranslatingFront = false;
  let isTranslatingBack = false;
  let translatedTextFront = "";
  let translatedTextBack = "";
  let selectedLanguage = "es"; // Default to Spanish
  let translationErrorFront = "";
  let translationErrorBack = "";

  // TTS Language Dropdown
  let availableVoices: SpeechSynthesisVoice[] = [];
  let selectedVoice: SpeechSynthesisVoice | null = null;

  $: currentCard = deck?.cards[currentCardIndex];
  $: hasNextCard = deck && currentCardIndex < deck.cards.length - 1;
  $: hasPrevCard = currentCardIndex > 0;

  onMount(() => {
    if (!deck || deck.cards.length === 0) {
      goto("/dashboard");
      return; // Important: Stop execution if redirecting
    }
    // Load available voices for TTS
    loadVoices();
  });

  function loadVoices() {
    // Use onvoiceschanged to ensure voices are loaded
    window.speechSynthesis.onvoiceschanged = () => {
      availableVoices = window.speechSynthesis.getVoices();
      // Try to load the previously selected voice, or default to the first available
      const savedVoiceURI = localStorage.getItem("selectedVoiceURI");
      selectedVoice =
        availableVoices.find((v) => v.voiceURI === savedVoiceURI) ||
        availableVoices[0];
    };

    // Check if voices are already loaded (they might be in some browsers)
    availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
      const savedVoiceURI = localStorage.getItem("selectedVoiceURI");
      selectedVoice =
        availableVoices.find((v) => v.voiceURI === savedVoiceURI) ||
        availableVoices[0];
    }
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      alert("Sorry, your browser does not support text-to-speech!");
      return;
    }

    if (!selectedVoice) {
      alert("No voice selected for text-to-speech!");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;

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

  async function translateText(text: string, isFront: boolean) {
    if (!text) return;

    try {
      if (isFront) {
        isTranslatingFront = true;
        translationErrorFront = "";
        translatedTextFront = "";
      } else {
        isTranslatingBack = true;
        translationErrorBack = "";
        translatedTextBack = "";
      }

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
      if (isFront) {
        translatedTextFront = data.translatedText;
      } else {
        translatedTextBack = data.translatedText;
      }
    } catch (error) {
      console.error("Translation error:", error);
      if (isFront) {
        translationErrorFront =
          error instanceof Error
            ? error.message
            : "Translation failed. Please try again.";
      } else {
        translationErrorBack =
          error instanceof Error
            ? error.message
            : "Translation failed. Please try again.";
      }
    } finally {
      if (isFront) {
        isTranslatingFront = false;
      } else {
        isTranslatingBack = false;
      }
    }
  }

  function updateProgress(progress: number) {
    if (!currentCard) return;

    appStore.updateCard(deckId, currentCard.id, {
      progress: progress,
    });

    if (hasNextCard) {
      setTimeout(nextCard, 500);
    }
  }

  function nextCard() {
    if (hasNextCard) {
      currentCardIndex++;
      showAnswer = false;
      translatedTextFront = "";
      translatedTextBack = "";
      translationErrorFront = "";
      translationErrorBack = "";
    }
  }

  function prevCard() {
    if (hasPrevCard) {
      currentCardIndex--;
      showAnswer = false;
      translatedTextFront = "";
      translatedTextBack = "";
      translationErrorFront = "";
      translationErrorBack = "";
    }
  }

  function toggleAnswer() {
    showAnswer = !showAnswer;
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
        <button class="finish-btn" on:click={finishStudying}>
          Finish Studying
        </button>
      </div>
    </div>

    <TtsLanguageSelector {availableVoices} bind:selectedVoice />

    <div class="flashcard-container">
      <div class="card flashcard">
        <FlashcardFront
          card={currentCard}
          {isSpeaking}
          bind:selectedLanguage
          {translatedTextFront}
          {translationErrorFront}
          {isTranslatingFront}
          {speak}
          {translateText}
        />

        {#if showAnswer}
          <FlashcardBack
            card={currentCard}
            {isSpeaking}
            {speak}
            {updateProgress}
            hideAnswer={toggleAnswer}
            bind:selectedLanguage
            {translatedTextBack}
            {translationErrorBack}
            {isTranslatingBack}
            {translateText}
          />
        {:else}
          <div class="show-answer">
            <button on:click={toggleAnswer}>Show Answer</button>
          </div>
        {/if}

        <ProgressBar progress={currentCard.progress} />
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
  @use "sass:color";

  .study-view {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;

    .study-header {
      margin-bottom: 2rem;

      h1 {
        margin: 0;
        font-size: 2rem;
        color: var(--primary-color);
      }

      .controls {
        text-align: right;

        .progress-text {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .finish-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          background-color: var(--primary-color);
          color: white;
          font-size: 0.9rem;
          cursor: pointer;

          &:hover {
            background-color: color.adjust(#3a86ff, $lightness: -10%);
          }
        }
      }
    }

    .flashcard-container {
      margin-bottom: 2rem;

      .flashcard {
        padding: 1.5rem;
        background-color: var(--card-background);
        border: 1px solid var(--card-border);
        border-radius: 8px;
        box-shadow: var(--shadow);

        .show-answer {
          display: flex;
          justify-content: center;
          margin: 2rem 0;

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
    }

    .navigation-controls {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;

      button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        background-color: var(--primary-color);
        color: white;
        font-size: 0.9rem;
        cursor: pointer;

        &:hover:not(:disabled) {
          background-color: color.adjust(#3a86ff, $lightness: -10%);
        }

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
