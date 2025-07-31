<script>
    import { page } from "$app/stores";
    import LeftSidebar from "../components/sidebar/LeftSidebar.svelte";
    import LoginForm from "./logIn/LoginForm.svelte";

    $: currentPath = $page.url.pathname;
    $: isChatsPage = currentPath === "/chats";

    import { onMount } from "svelte";
    import { themeStore } from "../lib/store/theme";

    onMount(() => {
        themeStore.initTheme();
    });
</script>

<div class="app">
    <LeftSidebar />

    <main>
        <slot />
        <LoginForm />
    </main>
</div>

<style>
    .app {
        display: flex;
        height: 100%;
        min-height: 100vh;
    }

    main {
        flex: 1;
        overflow: hidden;
    }

    :global(body) {
        margin: 0;
        padding: 0;
        background-color: var(--color-070709);
        color: var(--color-fff);
        font-family: "Inter", sans-serif;
    }
</style>
