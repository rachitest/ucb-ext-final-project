<script>
    // for mobile hamburger menu
    let isOpen = false;

    function toggleMenu() {
        isOpen = !isOpen;
    }
</script>

<nav class="bg-white dark:bg-gray-800 shadow-md p-4">
    <div class="container mx-auto flex items-center justify-between flex-wrap">
        <div class="flex items-center">
            <a
                href="/"
                class="text-blue-500 dark:text-blue-400 font-bold text-xl"
            >
                [Logo] [App Name]
            </a>
        </div>

        <!--Hamburger Menu Icon-->
        <div class="block lg:hidden">
            <button
                on:click={toggleMenu}
                class="flex items-center px-3 py-2 border rounded text-gray-500 border-gray-600 hover:text-blue-500 hover:border-blue-500 dark:text-gray-400 dark:border-gray-400 dark:hover:text-blue-400"
            >
                <svg
                    class="fill-current h-3 w-3"
                    viewBox="0 0 20 20"
                    xlmns="http://www.w3.org/2000/svg"
                >
                    <title>Menu</title>
                    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                </svg>
            </button>
        </div>

        <!--Navigation Links-->
        <div
            class:hidden={!isOpen}
            class="w-full lg:w-auto lg:flex lg:items-center lg:space-x-6"
        >
            <a
                href="/"
                class="block mt-4 lg:inline-block lg:mt-0 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                >My Decks</a
            >
            <a
                href="/create"
                class="block mt-4 lg:inline-block lg:mt-0 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                >Create Deck</a
            >
            <a
                href="/practice"
                class="block mt-4 lg:inline-block lg:mt-0 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                >Practice</a
            >
            <a
                href="/settings"
                class="block mt-4 lg:inline-block lg:mt-0 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                >Settings</a
            >
            /**Add a user icon/dropdown here later for login/logout */
        </div>
    </div>
</nav>
