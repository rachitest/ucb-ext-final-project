<script lang="ts">
    import { decks, appStore } from "$lib/stores/appStore";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let showNewDeckForm = false;
    let newDeckName = "";
    let newDeckDescription = "";

    function toggleNewDeckForm() {
        showNewDeckForm = !showNewDeckForm;
        if (!showNewDeckForm) {
            newDeckName = "";
            newDeckDescription = "";
        }
    }

    function createNewDeck() {
        if (newDeckName.trim()) {
            appStore.addDeck(newDeckName.trim(), newDeckDescription.trim());
            newDeckName = "";
            newDeckDescription = "";
            showNewDeckForm = false;
        }
    }

    function deleteDeck(id: string) {
        if (confirm("Are you sure you want to delete this deck?")) {
            appStore.deleteDeck(id);
        }
    }

    function formatDate(date: Date): string {
        return new Date(date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }
</script>

<div class="dashboard">
    <div class="dashboard-header">
        <h1>Your Flashcard Decks</h1>
        <button on:click={toggleNewDeckForm}>
            {showNewDeckForm ? "Cancel" : "+ New Deck"}
        </button>
    </div>

    {#if showNewDeckForm}
        <div class="card new-deck-form">
            <h2>Create New Deck</h2>
            <div class="form-group">
                <label for="deck-name">Deck Name</label>
                <input
                    id="deck-name"
                    type="text"
                    bind:value={newDeckName}
                    placeholder="Enter deck name"
                />
            </div>
            <div class="form-group">
                <label for="deck-description">Description (optional)</label>
                <textarea
                    id="deck-description"
                    bind:value={newDeckDescription}
                    placeholder="Enter deck description"
                    rows="3"
                ></textarea>
            </div>
            <div class="form-actions">
                <button class="secondary" on:click={toggleNewDeckForm}
                    >Cancel</button
                >
                <button on:click={createNewDeck}>Create Deck</button>
            </div>
        </div>
    {/if}

    {#if $decks.length === 0}
        <div class="empty-state">
            <p>
                You don't have any flashcard decks yet. Create your first deck
                to get started!
            </p>
            {#if !showNewDeckForm}
                <button on:click={toggleNewDeckForm}
                    >Create Your First Deck</button
                >
            {/if}
        </div>
    {:else}
        <div class="grid">
            {#each $decks as deck}
                <div class="card deck">
                    <div class="deck-header flex-between">
                        <h2>{deck.name}</h2>
                        <button
                            class="icon-button"
                            on:click={() => deleteDeck(deck.id)}>🗑️</button
                        >
                    </div>
                    <p class="deck-description">
                        {deck.description || "No description"}
                    </p>
                    <div class="deck-info">
                        <p>
                            {deck.cards.length}
                            {deck.cards.length === 1 ? "card" : "cards"}
                        </p>
                        <p>Created: {formatDate(deck.created)}</p>
                    </div>
                    <div class="progress-container">
                        <div class="progress-label flex-between">
                            <span>Progress</span>
                            <span>{Math.round(deck.totalProgress)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div
                                class="progress"
                                style="width: {deck.totalProgress}%"
                            ></div>
                        </div>
                    </div>
                    <div class="deck-actions">
                        <button on:click={() => goto(`/deck/${deck.id}`)}
                            >View Deck</button
                        >
                        {#if deck.cards.length > 0}
                            <button
                                class="secondary"
                                on:click={() => goto(`/study/${deck.id}`)}
                                >Study Now</button
                            >
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
    .dashboard {
        &-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;

            h1 {
                margin: 0;
            }
        }
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        background-color: var(--card-background);
        border-radius: 8px;
        margin: 2rem 0;

        p {
            margin-bottom: 1.5rem;
            font-size: 1.1rem;
        }
    }

    .new-deck-form {
        margin-bottom: 2rem;

        h2 {
            margin-top: 0;
            margin-bottom: 1.5rem;
        }

        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 1rem;
        }
    }

    .deck {
        display: flex;
        flex-direction: column;

        &-header {
            margin-bottom: 0.5rem;

            h2 {
                margin: 0;
                font-size: 1.5rem;
            }
        }

        &-description {
            color: var(--text-color);
            opacity: 0.8;
            margin-bottom: 1rem;
            flex: 1;
        }

        &-info {
            display: flex;
            justify-content: space-between;
            font-size: 0.875rem;
            opacity: 0.7;
            margin-bottom: 1rem;
        }

        .progress-container {
            margin-bottom: 1rem;

            .progress-label {
                font-size: 0.875rem;
                margin-bottom: 0.25rem;
            }
        }

        &-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: auto;
        }
    }
</style>
