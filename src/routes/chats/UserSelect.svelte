<script lang="ts">
     import type { User } from '../../lib/types/type';
    
    export let users: User[] = [];
    export let selectedUserId: string | null = null;
    export let onUserSelect: (user: User) => void = () => {};
    export let activePlatform: "WhatsApp" | "Telegram" | "Instagram" | null = null;
    export let activeStatus: "Online" | "Offline" | "Human Required" | null = null;

    // Статуси та їх кольори
    const statusConfig: Record<string, { color: string; label: string }> = {
        "on-going": { color: "#4DE944", label: "Online" },
        offline: { color: "#E94447", label: "Offline" },
        "human-required": { color: "#E9D644", label: "Human Required" },
        "no-info": { color: "#6b7280", label: "No Info" },
    };

    // Маппінг статусів фільтра до статусів користувачів
    const statusMapping: Record<string, string> = {
        "Online": "on-going",
        "Offline": "offline", 
        "Human Required": "human-required"
    };

    // Генерація рандомного градієнта для аватара
    function generateGradient(): string {
        const colors = [
            "#fbbf24", "#4DE944", "#8b5cf6", "#ec4899", "#3b82f6", "#2097F0",
            "#D0523B", "#9B84BA", "#C48C55", "#B13EB0", "#81589E", "#DAEBF9",
            "#D042C2", "#B85124", "#1F3C27", "#E1B310", "#2CF2A1", "#FFFFFF",
        ];
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        let color2 = colors[Math.floor(Math.random() * colors.length)];
        while (color2 === color1) {
            color2 = colors[Math.floor(Math.random() * colors.length)];
        }
        const angle = Math.floor(Math.random() * 360);
        return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    }

    // Кешування градієнтів для кожного користувача
    const gradientCache = new Map<string, string>();
    
    function getUserGradient(userId: string): string {
        if (!gradientCache.has(userId)) {
            gradientCache.set(userId, generateGradient());
        }
        return gradientCache.get(userId)!;
    }

    // Отримання ініціалів з нікнейму
    function getInitials(nickname: string): string {
        return nickname
            .split(" ")
            .map((word: string) => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join("");
    }

    // Обробка вибору користувача
    function handleUserSelect(user: User): void {
        selectedUserId = user.id;
        onUserSelect(user);
    }

    // Фільтрація користувачів
    $: filteredUsers = users.filter(user => {
        let platformMatch = true;
        let statusMatch = true;

        // Фільтр по платформі
        if (activePlatform) {
            platformMatch = user.platform === activePlatform;
        }

        // Фільтр по статусу
        if (activeStatus) {
            const mappedStatus = statusMapping[activeStatus];
            statusMatch = user.status === mappedStatus;
        }

        return platformMatch && statusMatch;
    });
</script>

<div class="block-users">
    {#if filteredUsers.length === 0}
        <div class="no-users">
            <p>No users found</p>
        </div>
    {:else}
        {#each filteredUsers as user (user.id)}
            <div
                class="user"
                class:selected={selectedUserId === user.id}
                on:click={() => handleUserSelect(user)}
                role="button"
                tabindex="0"
                on:keydown={(e) => e.key === "Enter" && handleUserSelect(user)}
            >
                <div
                    class="avatar"
                    style="background: {getUserGradient(user.id)}"
                >
                    
                </div>
                <div class="text">
                    <h3>{user.nickname}</h3>
                    <div class="status">
                        <p>{statusConfig[user.status]?.label || "Unknown"}</p>
                        <div
                            class="status-indicator"
                            style="background-color: {statusConfig[user.status]
                                ?.color || '#6b7280'}"
                        ></div>
                    </div>
                </div>
            </div>
        {/each}
    {/if}
</div>

<style>
    .block-users {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 800px;
        overflow-y: auto;
    }

    .user {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
    }

    .user.selected {
        background-color: #530549;
        color: white;
    }

    .user.selected h3 {
        color: white;
    }

    .user.selected .status p {
        color: rgba(255, 255, 255, 0.9);
    }

    .avatar {
        width: 34px;
        height: 34px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
    }



    .text {
        flex: 1;
        min-width: 0;
    }

    .text h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 400;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .status {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
    }

    .status p {
        margin: 0;
        font-size: 12px;
        color: #9b9ca3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .no-users {
        text-align: center;
        padding: 32px 16px;
    }

    .no-users p {
        margin: 0;
        color: #6b7280;
        font-size: 16px;
    }

    /* Скролбар */
    .block-users::-webkit-scrollbar {
        width: 6px;
    }

    .block-users::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
    }

    .block-users::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
    }

    .block-users::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
</style>
