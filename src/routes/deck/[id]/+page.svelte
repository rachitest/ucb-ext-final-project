<script lang="ts">
    import { page } from "$app/stores";
    import { decks, appStore } from "$lib/stores/appStore";
    import { goto } from "$app/navigation";
    import type { Card } from "$lib/types";
    import { onMount } from "svelte";

    const deckId = $page.params.id;
    let deck = $decks.find((d) => d.id === deckId);

    let showNewCardForm = false;
    let newCardFront = "";
    let newCardBack = "";

    let editingCard: Card | null = null;
    let editFront = "";
    let editBack = "";

    $: {
        // Update deck whenever decks store changes
        deck = $decks.find((d) => d.id === deckId);
    }

    onMount(() => {
        if (!deck) {
            goto("/dashboard");
        }
    });

    function toggleNewCardForm() {
        showNewCardForm = !showNewCardForm;
        if (!showNewCardForm) {
            newCardFront = "";
            newCardBack = "";
        }
    }

    function createNewCard() {
        if (newCardFront.trim() && newCardBack.trim()) {
            appStore.addCard(deckId, newCardFront.trim(), newCardBack.trim());
            newCardFront = "";
            newCardBack = "";
            showNewCardForm = false;
        }
    }

    function startEditingCard(card: Card) {
        editingCard = card;
        editFront = card.front;
        editBack = card.back;
    }

    function saveEditedCard() {
        if (editingCard && editFront.trim() && editBack.trim()) {
            appStore.updateCard(deckId, editingCard.id, {
                front: editFront.trim(),
                back: editBack.trim(),
            });
            cancelEditing();
        }
    }

    function cancelEditing() {
        editingCard = null;
        editFront = "";
        editBack = "";
    }

    function deleteCard(cardId: string) {
        if (confirm("Are you sure you want to delete this card?")) {
            appStore.deleteCard(deckId, cardId);
        }
    }

    function deleteDeck() {
        if (
            confirm(`Are you sure you want to delete the deck "${deck?.name}"?`)
        ) {
            appStore.deleteDeck(deckId);
            goto("/dashboard");
        }
    }

    function formatProgress(progress: number): string {
        return `${Math.round(progress)}%`;
    }
</script>

{#if deck}
    <div class="deck-view">
        <div class="deck-header">
            <div class="flex-between">
                <h1>{deck.name}</h1>
                <div class="deck-actions">
                    <button
                        on:click={() => goto(`/study/${deck.id}`)}
                        disabled={deck.cards.length === 0}
                    >
                        Study Now
                    </button>
                    <button class="danger" on:click={deleteDeck}
                        >Delete Deck</button
                    >
                </div>
            </div>
            <p class="deck-description">
                {deck.description || "No description"}
            </p>

            <div class="deck-stats">
                <div class="stat">
                    <span class="stat-label">Cards</span>
                    <span class="stat-value">{deck.cards.length}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Overall Progress</span>
                    <span class="stat-value"
                        >{formatProgress(deck.totalProgress)}</span
                    >
                </div>
            </div>

            <div class="progress-bar">
                <div
                    class="progress"
                    style="width: {deck.totalProgress}%"
                ></div>
            </div>
        </div>

        <div class="deck-content">
            <div class="section-header flex-between">
                <h2>Cards</h2>
                <button on:click={toggleNewCardForm}>
                    {showNewCardForm ? "Cancel" : "+ Add Card"}
                </button>
            </div>

            {#if showNewCardForm}
                <div class="card new-card-form">
                    <h3>Add New Card</h3>
                    <div class="form-group">
                        <label for="card-front">Front</label>
                        <textarea
                            id="card-front"
                            bind:value={newCardFront}
                            placeholder="Question or term"
                            rows="3"
                        ></textarea>
                    </div>
                    <div class="form-group">
                        <label for="card-back">Back</label>
                        <textarea
                            id="card-back"
                            bind:value={newCardBack}
                            placeholder="Answer or definition"
                            rows="3"
                        ></textarea>
                    </div>
                    <div class="form-actions">
                        <button class="secondary" on:click={toggleNewCardForm}
                            >Cancel</button
                        >
                        <button on:click={createNewCard}>Add Card</button>
                    </div>
                </div>
            {/if}

            {#if deck.cards.length === 0}
                <div class="empty-state">
                    <p>
                        This deck doesn't have any cards yet. Add your first
                        card to start studying!
                    </p>
                    {#if !showNewCardForm}
                        <button on:click={toggleNewCardForm}
                            >Add Your First Card</button
                        >
                    {/if}
                </div>
            {:else}
                <div class="cards-list">
                    {#each deck.cards as card (card.id)}
                        <div class="card flashcard">
                            {#if editingCard && editingCard.id === card.id}
                                <div class="card-edit-form">
                                    <div class="form-group">
                                        <label for="edit-front">Front</label>
                                        <textarea
                                            id="edit-front"
                                            bind:value={editFront}
                                            rows="3"
                                        ></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-back">Back</label>
                                        <textarea
                                            id="edit-back"
                                            bind:value={editBack}
                                            rows="3"
                                        ></textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button
                                            class="secondary"
                                            on:click={cancelEditing}
                                            >Cancel</button
                                        >
                                        <button on:click={saveEditedCard}
                                            >Save</button
                                        >
                                    </div>
                                </div>
                            {:else}
                                <div class="card-content">
                                    <div class="card-front">
                                        <h4>Front</h4>
                                        <p>{card.front}</p>
                                    </div>
                                    <div class="card-back">
                                        <h4>Back</h4>
                                        <p>{card.back}</p>
                                    </div>
                                    <div class="card-progress">
                                        <div
                                            class="progress-label flex-between"
                                        >
                                            <span>Progress</span>
                                            <span
                                                >{formatProgress(
                                                    card.progress,
                                                )}</span
                                            >
                                        </div>
                                        <div class="progress-bar">
                                            <div
                                                class="progress"
                                                style="width: {card.progress}%"
                                            ></div>
                                        </div>
                                    </div>
                                    <div class="card-actions flex-between">
                                        <div>
                                            <button
                                                class="small"
                                                on:click={() =>
                                                    startEditingCard(card)}
                                                >Edit</button
                                            >
                                            <button
                                                class="small danger"
                                                on:click={() =>
                                                    deleteCard(card.id)}
                                                >Delete</button
                                            >
                                        </div>
                                        <div class="last-studied">
                                            {#if card.lastStudied}
                                                <span
                                                    >Last studied: {new Date(
                                                        card.lastStudied,
                                                    ).toLocaleDateString()}</span
                                                >
                                            {:else}
                                                <span>Not studied yet</span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
{:else}
    <div class="loading">Loading deck...</div>
{/if}

<style lang="scss">
    .deck-view {
        .deck-header {
            margin-bottom: 2rem;

            h1 {
                margin: 0 0 0.5rem 0;
            }

            .deck-description {
                margin-bottom: 1.5rem;
                font-size: 1.1rem;
                opacity: 0.8;
            }

            .deck-stats {
                display: flex;
                gap: 2rem;
                margin-bottom: 0.5rem;

                .stat {
                    display: flex;
                    flex-direction: column;

                    .stat-label {
                        font-size: 0.875rem;
                        opacity: 0.7;
                    }

                    .stat-value {
                        font-size: 1.25rem;
                        font-weight: 600;
                    }
                }
            }

            .deck-actions {
                display: flex;
                gap: 1rem;
            }
        }

        .section-header {
            margin-bottom: 1.5rem;

            h2 {
                margin: 0;
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

        .new-card-form {
            margin-bottom: 2rem;

            h3 {
                margin-top: 0;
                margin-bottom: 1.5rem;
            }
        }

        .cards-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1.5rem;

            .flashcard {
                .card-content {
                    .card-front,
                    .card-back {
                        margin-bottom: 1.5rem;

                        h4 {
                            font-size: 1rem;
                            opacity: 0.7;
                            margin: 0 0 0.5rem 0;
                        }

                        p {
                            margin: 0;
                            word-break: break-word;
                        }
                    }

                    .card-progress {
                        margin-bottom: 1rem;

                        .progress-label {
                            font-size: 0.875rem;
                            margin-bottom: 0.25rem;
                        }
                    }

                    .card-actions {
                        .small {
                            font-size: 0.875rem;
                            padding: 0.35rem 0.75rem;
                        }

                        .last-studied {
                            font-size: 0.75rem;
                            opacity: 0.6;
                        }
                    }
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
