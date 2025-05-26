<script lang="ts">
    import WhatsApp from "../../lib/images/filters/whatsApp.png";
    import Telegram from "../../lib/images/filters/telega.png";
    import Instagram from "../../lib/images/filters/instagram.png";
    import Online from "../../lib/images/filters/onine.png";
    import Offline from "../../lib/images/filters/offline.png";
    import HumRequired from "../../lib/images/filters/flag.png";
    import UserSelect from "./UserSelect.svelte";

    type Platform = "WhatsApp" | "Telegram" | "Instagram" | null;
    type Status = "Online" | "Offline" | "Human Required" | null;

    type User = {
        id: string;
        nickname: string;
        status: "on-going" | "offline" | "human-required" | "no-info";
        platform: "WhatsApp" | "Telegram" | "Instagram";
    };

    // Експорт функції для передачі вибору користувача
    export let onUserSelect: (user: User) => void = () => {};

    let activePlatform: Platform = null;
    let activeStatus: Status = null;

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

    let users: User[] = [
        {
            id: "1",
            nickname: "Andrew Ross",
            status: "on-going",
            platform: "WhatsApp",
        },
        {
            id: "2",
            nickname: "Anna Staygard",
            status: "offline",
            platform: "Telegram",
        },
        {
            id: "3",
            nickname: "Nikita Kilan",
            status: "human-required",
            platform: "Instagram",
        },
        {
            id: "4",
            nickname: "Anna Johnson",
            status: "no-info",
            platform: "WhatsApp",
        },
        {
            id: "5",
            nickname: "David Brown",
            status: "on-going",
            platform: "Telegram",
        },
        {
            id: "6",
            nickname: "Daan Boonstra",
            status: "offline",
            platform: "Instagram",
        },
        {
            id: "7",
            nickname: "Tom Howell",
            status: "human-required",
            platform: "WhatsApp",
        },
        {
            id: "8",
            nickname: "Emma Davis",
            status: "on-going",
            platform: "Instagram",
        },
    ];

    let selectedUserId: string | null = null;

    function handleUserSelect(user: User): void {
        console.log("Вибрано користувача:", user);
        onUserSelect(user);
    }

    async function fetchUsers() {
        try {
            // const response = await fetch('/api/users');
            // users = await response.json();
        } catch (error) {
            console.error("Помилка завантаження користувачів:", error);
            users = [];
        }
    }

    $: activeFiltersCount = (activePlatform ? 1 : 0) + (activeStatus ? 1 : 0);
</script>

<!-- Решта HTML коду залишається без змін -->
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
            {#if activePlatform || activeStatus}
                <span class="filter-indicator"> Filtered </span>
            {/if}
        </div>
        <UserSelect
            {users}
            {activePlatform}
            {activeStatus}
            bind:selectedUserId
            onUserSelect={handleUserSelect}
        />
    </div>
</div>


<style>
    .filters {
        width: 100%;
        max-width: 300px;
        padding: 12px;
        padding-top: 2%;
        border-right: #3b3b3b 1px solid;
        font-family: "Inter", sans-serif;
        overflow-y: auto;
    }

    .filter-hdr {
        background-color: #121213;
        border: 1px solid #2b2b2b;
        text-align: center;
        padding: 8px;
        border-radius: 12px;
        color: white;
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
    }

    .clear-filters {
        background: #530505;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .clear-filters:hover {
        background: #c42424;
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
        color: #9b9ca3;
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
        background-color: rgba(255, 255, 255, 0.05);
    }

    /* .block-content.active {
       background-color: #530549; 
    }

    .block-content.active::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
       background-color: #4de944;
        border-radius: 0 2px 2px 0;
    }*/

    .block-img {
        background-color: #121213;
        border-radius: 6px;
        width: 26px;
        height: 26px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color 0.2s ease;
    }

    .block-content.active .block-img {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .block-img img {
        width: 16px;
        height: 16px;
    }

    .block-text {
        color: #9b9ca3;
        font-size: 12px;
        font-weight: 400;
        transition: color 0.2s ease;
        margin: 0;
    }

    .block-content.active .block-text {
        color: #ffffff;
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
        color: #ffffff;
        font-size: 14px;
        font-weight: 600;
        margin: 0;
        letter-spacing: 0.5px;
    }

    .filter-indicator {
        background: #121213;
        border: 1px solid #2b2b2b;
        color: #ffffff;
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
        background: #1a1a1a;
        border-radius: 3px;
    }

    .filters::-webkit-scrollbar-thumb {
        background: #3b3b3b;
        border-radius: 3px;
    }

    .filters::-webkit-scrollbar-thumb:hover {
        background: #4b4b4b;
    }

    /* Адаптивність */
    @media (max-width: 768px) {
        .filters {
            max-width: 100%;
            border-right: none;
            border-bottom: #3b3b3b 1px solid;
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
