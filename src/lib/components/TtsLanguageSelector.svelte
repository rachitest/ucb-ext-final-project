<script lang="ts">
    import { onMount } from "svelte";

    export let availableVoices: SpeechSynthesisVoice[];
    export let selectedVoice: SpeechSynthesisVoice | null;

    // Load the selected voice from localStorage
    onMount(() => {
        const savedVoiceURI = localStorage.getItem("selectedVoiceURI");
        if (savedVoiceURI) {
            const voice = availableVoices.find(
                (v) => v.voiceURI === savedVoiceURI,
            );
            if (voice) selectedVoice = voice;
        } else {
            // Set default voice to English if available
            const englishVoice = availableVoices.find((voice) =>
                voice.lang.startsWith("en"),
            );
            selectedVoice = englishVoice || availableVoices[0];
        }
    });

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
        {#each availableVoices as voice}
            <option value={voice}>{voice.name} ({voice.lang})</option>
        {/each}
    </select>
</div>
