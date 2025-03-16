<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { appStore, theme } from "$lib/stores/appStore";
    import { initializeTheme } from "$lib/theme";
    import "../styles/global.scss";

    onMount(() => {
        initializeTheme();
    });

    function toggleTheme() {
        appStore.toggleTheme();
    }
</script>

<header>
    <nav>
        <div class="container flex-between">
            <div class="logo">
                <a href="/">ZapLearn ⚡</a>
            </div>
            <div class="nav-links">
                <a href="/" class:active={$page.url.pathname === "/"}>Home</a>
                <a
                    href="/dashboard"
                    class:active={$page.url.pathname === "/dashboard"}
                    >Dashboard</a
                >
                <button class="theme-toggle" on:click={toggleTheme}>
                    {#if $theme === "light"}
                        <span>🌙</span>
                    {:else}
                        <span>☀️</span>
                    {/if}
                </button>
            </div>
        </div>
    </nav>
</header>

<main>
    <div class="container">
        <slot />
    </div>
</main>

<footer>
    <div class="container">
        <p>&copy; {new Date().getFullYear()} ZapLearn ⚡</p>
    </div>
</footer>

<style lang="scss">
    header {
        background-color: var(--card-background);
        box-shadow: var(--shadow);
        position: sticky;
        top: 0;
        z-index: 10;

        nav {
            padding: 1rem 0;

            .logo {
                font-size: 1.5rem;
                font-weight: 700;

                a {
                    color: var(--text-color);
                    text-decoration: none;
                }
            }

            .nav-links {
                display: flex;
                align-items: center;
                gap: 1.5rem;

                a {
                    color: var(--text-color);
                    text-decoration: none;
                    position: relative;

                    &.active,
                    &:hover {
                        color: var(--primary-color);
                    }

                    &.active::after {
                        content: "";
                        position: absolute;
                        bottom: -5px;
                        left: 0;
                        width: 100%;
                        height: 2px;
                        background-color: var(--primary-color);
                    }
                }

                .theme-toggle {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;

                    &:hover {
                        background-color: var(--card-border);
                    }
                }
            }
        }
    }

    main {
        min-height: calc(100vh - 140px);
        padding: 2rem 0;
    }

    footer {
        background-color: var(--card-background);
        padding: 1rem 0;
        text-align: center;
        font-size: 0.875rem;
    }
</style>
