<script lang="ts">
    import { onMount } from "svelte";
    import UserChat from "./UserChat.svelte";
    import Filters from "./Filters.svelte";
    import type { User } from "../../lib/types/type";

    let selectedUser: User | null = null;
    let isFullscreen: boolean = false;
    let backgroundImage: string | null = null;

    onMount(() => {
        const saved = localStorage.getItem("chatBackgroundImage");
        if (saved) {
            backgroundImage = saved;
        }
    });

    function handleUserSelect(user: User): void {
        selectedUser = user;
    }

    function handleBackToList(): void {
        selectedUser = null;
        isFullscreen = false;
    }

    function toggleFullscreen(): void {
        isFullscreen = !isFullscreen;
    }

    function handleBackgroundChange(event: CustomEvent): void {
        backgroundImage = event.detail.backgroundImage;
    }
</script>

<div class="main-container">
    {#if !isFullscreen}
        <Filters onUserSelect={handleUserSelect} />
    {/if}

    {#if selectedUser}
        <UserChat
            {selectedUser}
            {backgroundImage}
            onBackToList={handleBackToList}
            onToggleFullscreen={toggleFullscreen}
            {isFullscreen}
            on:backgroundChange={handleBackgroundChange}
        />
    {:else}
        <div class="chats-container">
            <h1>Your Chats</h1>
            <div class="chat-list">
                <p>
                    Watch, write and edit Alara's conversation with your
                    customers
                </p>
            </div>
        </div>
    {/if}
</div>

<style>
    .main-container {
        display: flex;
        height: 100vh;
    }

    .chats-container {
        flex: 1;
        color: #fff;
        padding-top: 4.2%;
        padding-left: 5%;
    }

    h1 {
        font-size: 30px;
    }

    .chat-list p {
        font-size: 14px;
        color: #9b9ca3;
        margin-top: 25px;
        font-weight: 500;
    }
</style>
