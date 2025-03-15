<script lang="ts">
    import { goto } from "$app/navigation";
</script>

<section class="hero">
    <h1>Welcome to Flashy</h1>
    <p>A useful tool for learning through customizable flashcards</p>
    <button on:click={() => goto("/dashboard")}>Get Started</button>
</section>

<section class="features">
    <h2>Features</h2>
    <div class="grid">
        <div class="card feature">
            <h3>Create Custom Decks</h3>
            <p>
                Organize your learning materials into custom decks to match your
                study needs.
            </p>
        </div>
        <div class="card feature">
            <h3>Track Your Progress</h3>
            <p>
                Monitor your learning progress for each deck and individual
                cards.
            </p>
        </div>
        <div class="card feature">
            <h3>Text-to-Speech</h3>
            <p>
                Listen to your flashcards with the built-in Web Speech API
                integration.
            </p>
        </div>
        <div class="card feature">
            <h3>Translation Support</h3>
            <p>
                Translate your flashcards to different languages using the DeepL
                API.
            </p>
        </div>
    </div>
</section>

<style lang="scss">
    .hero {
        text-align: center;
        padding: 4rem 1rem;
        background: linear-gradient(
            120deg,
            var(--primary-color),
            var(--secondary-color)
        );
        color: white;
        border-radius: 8px;
        margin-bottom: 2rem;

        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        p {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }

        button {
            background-color: white;
            color: var(--primary-color);
            font-size: 1.125rem;
            padding: 0.75rem 2rem;

            &:hover {
                background-color: rgba(255, 255, 255, 0.9);
            }
        }
    }

    .features {
        padding: 2rem 0;

        h2 {
            text-align: center;
            margin-bottom: 2rem;
            font-size: 2rem;
        }

        .feature {
            padding: 1.5rem;
            text-align: center;

            h3 {
                color: var(--primary-color);
                margin-bottom: 1rem;
            }
        }
    }
</style>
