<script lang="ts">
    import { onMount } from "svelte";

    export let availableVoices: SpeechSynthesisVoice[];
    export let selectedVoice: SpeechSynthesisVoice | null;

    // Removed onMount function to consolidate voice logic in the parent

    // Save the selected voice to localStorage
    $: {
        if (selectedVoice) {
            localStorage.setItem("selectedVoiceURI", selectedVoice.voiceURI);
        }
    }
</script>

<div class="tts-language-selector">
    <label for="tts-language">TTS Language:</label>
    <select id="tts-language" bind:value={selectedVoice}>
        {#if availableVoices.length === 0}
            <option value="" disabled>No voices available</option>
        {:else}
            {#each availableVoices as voice}
                <option value={voice}>{voice.name} ({voice.lang})</option>
            {/each}
        {/if}
    </select>
</div>

<style lang="scss">
    .tts-language-selector {
        margin-bottom: 1rem;

        label {
            margin-right: 0.5rem;
            font-weight: 500;
        }

        select {
            padding: 0.5rem;
            border: 1px solid var(--card-border);
            border-radius: 4px;
            background-color: var(--card-background);
            color: var(--text-color);
            font-size: 0.9rem;
        }
    }
</style>
