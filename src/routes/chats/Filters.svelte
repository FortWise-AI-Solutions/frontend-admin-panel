<script lang="ts">
    import { onMount } from "svelte";
    import WhatsApp from "../../lib/images/filters/whatsApp.png";
    import Telegram from "../../lib/images/filters/telega.png";
    import Instagram from "../../lib/images/filters/instagram.png";
    import Online from "../../lib/images/filters/onine.png";
    import Offline from "../../lib/images/filters/offline.png";
    import HumRequired from "../../lib/images/filters/flag.png";
    import UserSelect from "./UserSelect.svelte";
    import { getEndUsers } from "../../lib/supabase";
    import { mapEndUsersToUsers, type User } from "../../lib/userMpper";

    type Platform = "WhatsApp" | "Telegram" | "Instagram" | null;
    type Status = "Online" | "Offline" | "Human Required" | null;

    export let onUserSelect: (user: User) => void = () => {};
    export let clientId: number | undefined = undefined; // Додайте це для фільтрації по клієнту

    let activePlatform: Platform = null;
    let activeStatus: Status = null;
    let users: User[] = [];
    let selectedUserId: string | null = null;
    let loading = false;
    let error: string | null = null;

    const platforms = [
        { name: "WhatsApp", icon: WhatsApp },
        { name: "Telegram", icon: Telegram },
        { name: "Instagram", icon: Instagram },
    ];

    const statuses = [
        { name: "Online", icon: Online },
        { name: "Offline", icon: Offline },
        { name: "Human Required", icon: HumRequired },
    ];

    function selectFilter(type: "platform" | "status", value: string) {
        if (type === "platform") {
            activePlatform =
                activePlatform === value ? null : (value as Platform);
        } else {
            activeStatus = activeStatus === value ? null : (value as Status);
        }
        filterContent();
    }

    function filterContent() {
        console.log("Filtering by:", {
            platform: activePlatform,
            status: activeStatus,
        });
    }

    function clearAllFilters() {
        activePlatform = null;
        activeStatus = null;
        filterContent();
    }

    function handleUserSelect(user: User): void {
        console.log("Вибрано користувача:", user);
        onUserSelect(user);
    }

    async function fetchUsers() {
        loading = true;
        error = null;

        try {
            const endUsers = await getEndUsers(clientId);
            users = mapEndUsersToUsers(endUsers);
            console.log("Завантажено користувачів:", users.length);
        } catch (err) {
            console.error("Помилка завантаження користувачів:", err);
            error = "Не вдалося завантажити користувачів";
            users = [];
        } finally {
            loading = false;
        }
    }

    // Завантажуємо користувачів при монтуванні компонента
    onMount(() => {
        fetchUsers();
    });

    // Перезавантажуємо користувачів при зміні clientId
    $: if (clientId !== undefined) {
        fetchUsers();
    }

    $: activeFiltersCount = (activePlatform ? 1 : 0) + (activeStatus ? 1 : 0);
</script>

<div class="filters">
    <div class="filter-hdr">
        <h1>Filters</h1>
        {#if activeFiltersCount > 0}
            <button
                class="clear-filters"
                on:click={clearAllFilters}
                title="Clear all filters"
            >
                Clear ({activeFiltersCount})
            </button>
        {/if}
    </div>

    <div class="filters-block">
        <!-- Platforms -->
        <div class="block">
            <div class="block-title">
                <span>Platforms</span>
            </div>
            {#each platforms as { name, icon }}
                <button
                    class="block-content"
                    class:active={activePlatform === name}
                    on:click={() => selectFilter("platform", name)}
                    type="button"
                    aria-pressed={activePlatform === name}
                >
                    <div class="block-img">
                        <img src={icon} alt={name} />
                    </div>
                    <p class="block-text">{name}</p>
                </button>
            {/each}
        </div>

        <!-- Statuses -->
        <div class="block">
            <div class="block-title">
                <span>Status</span>
            </div>
            {#each statuses as { name, icon }}
                <button
                    class="block-content"
                    class:active={activeStatus === name}
                    on:click={() => selectFilter("status", name)}
                    type="button"
                    aria-pressed={activeStatus === name}
                >
                    <div class="block-img">
                        <img src={icon} alt={name} />
                    </div>
                    <p class="block-text">{name}</p>
                </button>
            {/each}
        </div>
    </div>

    <div class="select-user">
        <div class="users-header">
            <h2>Users</h2>
            {#if loading}
                <span class="loading-indicator">Loading...</span>
            {:else if activePlatform || activeStatus}
                <span class="filter-indicator">Filtered</span>
            {/if}
        </div>

        {#if error}
            <div class="error-message">
                <p>{error}</p>
                <button on:click={fetchUsers} class="retry-button">
                    Спробувати знову
                </button>
            </div>
        {:else}
            <UserSelect
                {users}
                {activePlatform}
                {activeStatus}
                bind:selectedUserId
                onUserSelect={handleUserSelect}
            />
        {/if}
    </div>
</div>

<style>
    /* Ваші існуючі стилі + додаткові */
    .filters {
        width: 100%;
        max-width: 300px;
        padding: 12px;
        padding-top: 2%;
        border-right: 1px solid var(--color-232426);
        font-family: "Inter", sans-serif;
        overflow-y: auto;
        background-color: var(--color-070709);
    }

    /* ... всі ваші існуючі стилі ... */

    .loading-indicator {
        background: var(--color-121213);
        border: 1px solid var(--color-232426);
        color: var(--color-9b9ca3);
        font-size: 8px;
        font-weight: 600;
        padding: 4px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .error-message {
        background: var(--color-121213);
        border: 1px solid #e00909;
        border-radius: 8px;
        padding: 12px;
        text-align: center;
    }

    .error-message p {
        color: #e00909;
        font-size: 12px;
        margin: 0 0 8px 0;
    }

    .retry-button {
        background: #e00909;
        color: #fff;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 11px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .retry-button:hover {
        background: #af0000;
    }

    /* Всі ваші інші існуючі стилі залишаються без змін */
    .filter-hdr {
        background-color: var(--color-121213);
        border: 1px solid var(--color-232426);
        text-align: center;
        padding: 8px;
        border-radius: 12px;
        color: var(--color-fff);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }

    .filter-hdr h1 {
        letter-spacing: 0.5px;
        font-size: 14px;
        font-weight: 400;
        margin: 0;
        color: var(--color-fff);
    }

    .clear-filters {
        background: #e00909;
        color: #fff;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .clear-filters:hover {
        background: #af0000;
    }

    .filters-block {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        gap: 16px;
    }

    .block {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
    }

    .block-title {
        margin-bottom: 5px;
    }

    .block-title span {
        color: var(--color-9b9ca3);
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .block-content {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        background: none;
        border: none;
        padding: 6px;
        padding-left: 0;
        text-align: left;
        border-radius: 6px;
        transition: all 0.2s ease;
        position: relative;
    }

    .block-content:hover {
        background-color: var(--color-232426);
    }

    .block-img {
        background-color: var(--color-121213);
        border-radius: 6px;
        width: 26px;
        height: 26px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color 0.2s ease;
    }

    .block-img img {
        width: 16px;
        height: 16px;
    }

    .block-text {
        color: var(--color-9b9ca3);
        font-size: 12px;
        font-weight: 400;
        transition: color 0.2s ease;
        margin: 0;
    }

    .block-content.active .block-text {
        color: var(--color-ffffff);
        font-weight: 500;
    }

    .select-user {
        margin-top: 40px;
    }

    .users-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 0 4px;
    }

    .users-header h2 {
        color: var(--color-ffffff);
        font-size: 14px;
        font-weight: 600;
        margin: 0;
        letter-spacing: 0.5px;
    }

    .filter-indicator {
        background: var(--color-121213);
        border: 1px solid var(--color-232426);
        color: var(--color-ffffff);
        font-size: 8px;
        font-weight: 600;
        padding: 4px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Скролбар для всього контейнера */
    .filters::-webkit-scrollbar {
        width: 6px;
    }

    .filters::-webkit-scrollbar-track {
        background: var(--color-131416);
        border-radius: 3px;
    }

    .filters::-webkit-scrollbar-thumb {
        background: var(--color-232426);
        border-radius: 3px;
    }

    .filters::-webkit-scrollbar-thumb:hover {
        background: var(--color-9b9ca3);
    }

    /* Адаптивність */
    @media (max-width: 768px) {
        .filters {
            max-width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--color-232426);
        }

        .filters-block {
            flex-direction: column;
            gap: 20px;
        }

        .block {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 8px;
        }

        .block-title {
            width: 100%;
            margin-bottom: 8px;
        }
    }
</style>
