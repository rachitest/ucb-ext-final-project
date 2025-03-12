<script>
    import Navbar from "$lib/Navbar.svelte";
    import { onMount } from "svelte";

    /**
     * @type {string | any[]}
     */
    let decks = [];

    onMount(async () => {
        //Temp hardcoded decks since backend isn't initialized
        decks = [
            { id: 1, title: "French Vocabulary", cards: 15, progress: 60 },
            { id: 2, title: "Spanish Verbs", cards: 30, progress: 20 },
            { id: 3, title: "German Nouns", cards: 10, progress: 80 },
        ];
    });
</script>

<Navbar />

<main class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">My Decks</h1>

    {#if decks.length === 0}
        <p>No decks yet. Create one!</p>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each decks as deck (deck.id)}
                <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                    <h2 class="text-lg font-semibold">{deck.title}</h2>
                    <p class="text-gray-600 dark:text-gray-400">
                        {deck.cards} Cards
                    </p>
                    <div
                        class="h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2"
                    >
                        <div
                            class="h-full bg-blue-500 rounded-full"
                            style="width: {deck.progress}%"
                        ></div>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <button
                            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            /** Three-dot menu icon (replace with actual icon)
                            */ ...
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <div class="mt-8">
        <a
            href="/create"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
            Create New Deck
        </a>
    </div>
</main>
