<script>
    import { page } from "$app/stores";
    import LeftSidebar from "../components/sidebar/LeftSidebar.svelte";
    import LoginForm from "./logIn/LoginForm.svelte";
    import Filters from "./chats/Filters.svelte";

    $: currentPath = $page.url.pathname;
    $: isChatsPage = currentPath === '/chats';
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
        height: 100vh;
    }
    
    main {
        flex: 1;
        overflow: hidden;
    }
</style>
