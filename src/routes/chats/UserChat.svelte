<script lang="ts">
    import type { User } from "../../lib/types/type";
    import iconFC from "../../lib/images/full-screen-on.png";
    import iconSC from "../../lib/images/full-screen-off.png";
    import hisIcon from "../../lib/images/history.png";
    import alara from "../../lib/images/alara.png";
    import { themeStore } from "../../lib/store/theme";
    import { supabase } from "../../lib/supabaseClient";
    import { onMount, onDestroy } from "svelte";

    export let selectedUser: User;
    export let onBackToList: () => void = () => {};
    export let onToggleFullscreen: () => void = () => {};
    export let isFullscreen: boolean = false;
    export let backgroundImage: string | null = null;
    export let currentClientId: number = 1;

    // Типи для повідомлень з бази даних
    interface DatabaseMessage {
        id: number;
        client_id: number;
        bot_id: number | null;
        end_user_id: number | null;
        content: string | null;
        platform: string | null;
        time: string | null;
        raw_payload: any;
        response: string | null;
    }

    // Типи для відображення повідомлень
    interface Message {
        id: string;
        text: string;
        sender: "user" | "bot";
        timestamp: string;
        date: string;
        originalId: number;
        isNew?: boolean;
    }

    // Статуси та їх кольори
    const statusConfig: Record<string, { color: string; label: string }> = {
        "on-going": { color: "#4DE944", label: "Online" },
        offline: { color: "#E94447", label: "Offline" },
        "human-required": { color: "#E9D644", label: "Human Required" },
        "no-info": { color: "#6b7280", label: "No Info" },
    };

    // Генерація градієнта для аватара
    function generateGradient(): string {
        const colors = [
            "#fbbf24",
            "#4DE944",
            "#8b5cf6",
            "#ec4899",
            "#3b82f6",
            "#2097F0",
            "#D0523B",
            "#9B84BA",
            "#C48C55",
            "#B13EB0",
            "#81589E",
            "#DAEBF9",
            "#D042C2",
            "#B85124",
            "#1F3C27",
            "#E1B310",
            "#2CF2A1",
            "#FFFFFF",
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

    function getInitials(nickname: string): string {
        return nickname
            .split(" ")
            .map((word: string) => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join("");
    }

    // Стан повідомлень та завантаження
    let messages: Message[] = [];
    let loading: boolean = false;
    let error: string | null = null;
    let newMessage: string = "";
    let messagesContainer: HTMLElement;
    let currentUserId: string = "";
    let updateInterval: NodeJS.Timeout | null = null;
    let lastMessageCount: number = 0;
    let isAtBottom: boolean = true;

    // Стан для історії та Алари
    let showHistory: boolean = false;
    let isAlaraEnabled: boolean = true;
    let showConfirmModal: boolean = false;
    let confirmAction: "enable" | "disable" | null = null;

    // Змінні для роботи з повідомленнями
    let sendingMessage: boolean = false;
    let sendError: string | null = null;

    // Функція для завантаження повідомлень з бази даних
    async function loadMessages(silent: boolean = false): Promise<void> {
        if (!selectedUser?.id) return;
        if (!silent) {
            loading = true;
        }
        error = null;

        try {
            const { data, error: fetchError } = await supabase
                .from("messages")
                .select("*")
                .eq("end_user_id", parseInt(selectedUser.id))
                .order("time", { ascending: true });

            if (fetchError) {
                throw fetchError;
            }

            const newMessages = convertDatabaseMessagesToDisplayMessages(
                data || [],
            );

            // Перевіряємо чи є нові повідомлення
            const hasNewMessages = newMessages.length > lastMessageCount;
            lastMessageCount = newMessages.length;

            // Оновлюємо повідомлення тільки якщо є зміни
            if (JSON.stringify(messages) !== JSON.stringify(newMessages)) {
                messages = newMessages;
                // Прокручуємо до низу тільки якщо користувач був внизу або є нові повідомлення
                if (isAtBottom || hasNewMessages) {
                    setTimeout(() => {
                        scrollToBottom();
                    }, 50);
                }
            }
        } catch (err) {
            console.error("Error loading messages:", err);
            if (!silent) {
                error =
                    err instanceof Error
                        ? err.message
                        : "Failed to load messages";
            }
        } finally {
            if (!silent) {
                loading = false;
            }
        }
    }

    // Конвертація повідомлень з бази даних у формат для відображення
    function convertDatabaseMessagesToDisplayMessages(
        dbMessages: DatabaseMessage[],
    ): Message[] {
        const convertedMessages: Message[] = [];

        dbMessages.forEach((dbMsg) => {
            const timestamp = dbMsg.time ? new Date(dbMsg.time) : new Date();
            const timeString = timestamp.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
            const dateString = timestamp.toLocaleDateString("en-US");

            // Додаємо повідомлення користувача
            if (dbMsg.content) {
                convertedMessages.push({
                    id: `${dbMsg.id}-user`,
                    text: dbMsg.content,
                    sender: "user",
                    timestamp: timeString,
                    date: dateString,
                    originalId: dbMsg.id,
                });
            }

            // Додаємо відповідь бота
            if (dbMsg.response) {
                convertedMessages.push({
                    id: `${dbMsg.id}-bot`,
                    text: dbMsg.response,
                    sender: "bot",
                    timestamp: timeString,
                    date: dateString,
                    originalId: dbMsg.id,
                });
            }
        });

        return convertedMessages;
    }

    // Функція для перевірки чи користувач внизу чату
    function checkIfAtBottom(): void {
        if (messagesContainer) {
            const threshold = 100; // пікселів від низу
            isAtBottom =
                messagesContainer.scrollHeight -
                    messagesContainer.scrollTop -
                    messagesContainer.clientHeight <
                threshold;
        }
    }

    // Функція для прокрутки до низу
    function scrollToBottom(): void {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            isAtBottom = true;
        }
    }

    // Add debouncing to prevent excessive updates
    let updateTimeout: NodeJS.Timeout | null = null;
    function debouncedLoadMessages(silent: boolean = false) {
        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }
        updateTimeout = setTimeout(() => {
            loadMessages(silent);
        }, 100);
    }

    // Замініть існуючу функцію sendMessage на цю:
    async function sendMessage(): Promise<void> {
        if (newMessage.trim() === "" || !selectedUser?.id || sendingMessage)
            return;

        const messageText = newMessage.trim();
        newMessage = "";
        sendingMessage = true;
        sendError = null;

        try {
            console.log("Sending message:", {
                userId: selectedUser.id,
                message: messageText,
                platform: selectedUser.platform,
            });

            const response = await fetch(
                "https://1141-2a01-14-8031-1a60-e9af-9f0c-f527-6ab9.ngrok-free.app/send-message", // Заміни на свій URL, /send-message -> лишити
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true",
                    },
                    body: JSON.stringify({
                        userId: parseInt(selectedUser.id),
                        message: messageText,
                        platform: selectedUser.platform,
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error ||
                        `HTTP ${response.status}: ${response.statusText}`,
                );
            }

            const result = await response.json();
            console.log("Server response:", result); // Додаємо логування відповіді сервера

            if (result.success) {
                console.log("Message sent successfully:", result);
                if (result.delivery_status === "delivered") {
                    console.log("✅ Message delivered to user");
                } else {
                    console.warn("⚠️ Message saved but delivery failed");
                    sendError = "Message saved but delivery failed";
                }
            } else {
                throw new Error(result.error || "Failed to send message");
            }

            // Оновлюємо повідомлення після відправки
            setTimeout(() => {
                loadMessages(true);
            }, 500); // Невелика затримка для забезпечення збереження в БД
        } catch (err) {
            console.error("Error sending message:", err);
            sendError =
                err instanceof Error ? err.message : "Failed to send message";
            newMessage = messageText;
        } finally {
            sendingMessage = false;
        }
    }

    // Обробка натискання Enter
    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    // Функція для запуску автоматичного оновлення
    function startAutoUpdate(): void {
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        updateInterval = setInterval(() => {
            if (selectedUser?.id) {
                loadMessages(true); // silent = true, щоб не показувати індикатор завантаження
            }
        }, 1000); // Оновлення кожну секунду
    }

    // Функція для зупинки автоматичного оновлення
    function stopAutoUpdate(): void {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
    }

    // Функції для роботи з історією
    function toggleHistory(): void {
        showHistory = !showHistory;
    }

    function getUserMessages(): Message[] {
        return messages.filter((msg) => msg.sender === "user");
    }

    function groupMessagesByDate(
        userMessages: Message[],
    ): Record<string, Message[]> {
        const grouped = userMessages.reduce(
            (acc: Record<string, Message[]>, msg: Message) => {
                if (!acc[msg.date]) {
                    acc[msg.date] = [];
                }
                acc[msg.date].push(msg);
                return acc;
            },
            {},
        );
        return grouped;
    }

    // Функції для керування Аларою
    function handleAlaraToggle(): void {
        confirmAction = isAlaraEnabled ? "disable" : "enable";
        showConfirmModal = true;
    }

    function confirmAlaraAction(): void {
        if (confirmAction === "disable") {
            isAlaraEnabled = false;
        } else if (confirmAction === "enable") {
            isAlaraEnabled = true;
        }
        showConfirmModal = false;
        confirmAction = null;
    }

    function cancelAlaraAction(): void {
        showConfirmModal = false;
        confirmAction = null;
    }

    // Обробка клавіатури для модального вікна
    function handleModalKeydown(event: KeyboardEvent): void {
        if (event.key === "Escape") {
            cancelAlaraAction();
        }
    }

    // Реактивні змінні
    $: userMessages = getUserMessages();
    $: groupedMessages = groupMessagesByDate(userMessages);

    // Функція для отримання стилю фону
    function getChatBackgroundStyle(): string {
        if (backgroundImage) {
            return `
                background-image: url(${backgroundImage});
                background-position: center center;
                background-size: cover;
                background-repeat: no-repeat;
                background-attachment: local;
            `;
        }
        return $themeStore === "dark"
            ? "background-color: #1a1a1a;"
            : "background-color: #f5f5f5;";
    }

    // Lifecycle hooks
    onMount(() => {
        console.log("UserChat mounted for user:", selectedUser.id);
        currentUserId = selectedUser.id;
        loadMessages();
        startAutoUpdate();
        // Додаємо слухач для відстеження прокрутки
        if (messagesContainer) {
            messagesContainer.addEventListener("scroll", checkIfAtBottom);
        }
    });

    onDestroy(() => {
        console.log("UserChat destroyed");
        stopAutoUpdate();
        if (messagesContainer) {
            messagesContainer.removeEventListener("scroll", checkIfAtBottom);
        }
    });

    // Реактивне оновлення при зміні користувача
    $: if (selectedUser?.id && selectedUser.id !== currentUserId) {
        console.log(`User changed from ${currentUserId} to ${selectedUser.id}`);
        // Prevent multiple rapid changes
        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }
        updateTimeout = setTimeout(() => {
            currentUserId = selectedUser.id;
            messages = [];
            error = null;
            sendError = null;
            lastMessageCount = 0;
            stopAutoUpdate();
            loadMessages();
            startAutoUpdate();
        }, 200);
    }
</script>

<div
    class="chat-container"
    class:fullscreen={isFullscreen}
    class:dark={$themeStore === "dark"}
    class:light={$themeStore === "light"}
    style={getChatBackgroundStyle()}
>
    <!-- Header чату -->
    <div class="chat-header">
        <button
            class="back-button"
            on:click={onBackToList}
            aria-label="Back to user list"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </button>
        <div class="user-info">
            <div class="user-details">
                <!-- Try different possible property names -->
                <h2>
                    {selectedUser.nickname ||
                        selectedUser.name ||
                        selectedUser.username ||
                        selectedUser.display_name ||
                        "Unknown User"}
                </h2>
                <div class="status">
                    <span class="status-text"
                        >{statusConfig[selectedUser.status]?.label ||
                            "no info"}</span
                    >
                    <div
                        class="status-indicator"
                        style="background-color: {statusConfig[
                            selectedUser.status
                        ]?.color || '#6b7280'}"
                    ></div>
                </div>
            </div>
        </div>

        <div class="header-actions">
            <div class="platform-badge">
                {selectedUser.platform}
            </div>
            <!-- Кнопка повноекранного режиму -->
            <button
                class="fullscreen-button"
                on:click={onToggleFullscreen}
                aria-label={isFullscreen
                    ? "Exit fullscreen"
                    : "Enter fullscreen"}
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
                {#if isFullscreen}
                    <!-- Іконка виходу з повноекранного режиму -->
                    <img
                        src={iconSC}
                        alt="Exit fullscreen"
                        style="width: 20px; height: 20px;"
                    />
                {:else}
                    <!-- Іконка входу в повноекранний режим -->
                    <img
                        src={iconFC}
                        alt="Enter fullscreen"
                        style="width: 20px; height: 20px;"
                    />
                {/if}
            </button>
        </div>
    </div>

    <div class="chat-content">
        <!-- Область повідомлень -->
        <div class="messages-container" bind:this={messagesContainer}>
            {#if loading}
                <div class="loading-messages">
                    <div class="loading-spinner"></div>
                    <p>Loading messages...</p>
                </div>
            {:else if error}
                <div class="error-messages">
                    <p>Error loading messages: {error}</p>
                    <button
                        on:click={() => loadMessages()}
                        class="retry-button"
                    >
                        Retry
                    </button>
                </div>
            {:else if messages.length === 0}
                <div class="no-messages">
                    <p>No messages yet. Start a conversation!</p>
                </div>
            {:else}
                {#each messages as message (message.id)}
                    <div
                        class="message {message.sender}"
                        class:new-message={message.isNew}
                    >
                        <!-- Аватар зліва для повідомлень користувача -->
                        {#if message.sender === "user"}
                            <div
                                class="avatar"
                                style="background: {getUserGradient(
                                    selectedUser.id,
                                )}"
                            ></div>
                        {/if}
                        <div class="message-content">
                            <p>{message.text}</p>
                            <span class="timestamp">{message.timestamp}</span>
                        </div>
                        <!-- Аватар справа для повідомлень бота -->
                        {#if message.sender === "bot"}
                            <div
                                class="avatar"
                                style:background-image={`url('${alara}')`}
                                style:background-size="cover"
                            ></div>
                        {/if}
                    </div>
                {/each}
            {/if}
        </div>
    </div>

    <!-- Поле для введення повідомлення -->
    <div class="message-input-container">
        <input
            type="text"
            bind:value={newMessage}
            on:keydown={handleKeydown}
            placeholder="Write a message..."
            class="message-input"
            disabled={loading || sendingMessage}
        />
        <button
            class="send-button"
            on:click={sendMessage}
            disabled={newMessage.trim() === "" || loading || sendingMessage}
            aria-label="Send message"
        >
            {#if sendingMessage}
                <div class="sending-spinner"></div>
            {:else}
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M22 2L11 13"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M22 2L15 22L11 13L2 9L22 2Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            {/if}
        </button>
        <button
            class="history-button"
            on:click={toggleHistory}
            aria-label="Toggle history"
        >
            <img
                src={hisIcon}
                alt="Toggle history"
                style="width: 20px; height: 20px;"
            />
        </button>
    </div>

    <!-- Відображення помилки відправки -->
    {#if sendError}
        <div class="send-error">
            <p>Error: {sendError}</p>
            <button on:click={() => (sendError = null)} class="dismiss-error"
                >×</button
            >
        </div>
    {/if}
</div>

<!-- Панель історії -->
{#if showHistory}
    <div
        class="history-panel"
        class:show={showHistory}
        class:dark={$themeStore === "dark"}
        class:light={$themeStore === "light"}
    >
        <div class="history-header">
            <button
                class="alara-toggle-button"
                class:enabled={isAlaraEnabled}
                class:disabled={!isAlaraEnabled}
                on:click={handleAlaraToggle}
            >
                {isAlaraEnabled ? "Turn Off Alara" : "Turn On Alara"}
            </button>
            <button
                class="close-history-button"
                on:click={toggleHistory}
                aria-label="Close history"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                </svg>
            </button>
        </div>
        <div class="history-content">
            <div style="display: flex; align-items: flex-start; gap: 8px;">
                <h3>Chat History</h3>
                <img
                    src={hisIcon}
                    alt=""
                    style="width: 16px; height: 16px; margin-top: 2px;"
                />
            </div>
            {#if userMessages.length === 0}
                <p class="no-history">No user messages yet.</p>
            {:else}
                {#each Object.entries(groupedMessages) as [date, msgs]}
                    <div class="date-group">
                        <div class="date-header">{date}</div>
                        {#each msgs as msg}
                            <div class="history-message">
                                <span class="history-timestamp"
                                    >{msg.timestamp}</span
                                >
                                <p class="history-text">{msg.text}</p>
                            </div>
                        {/each}
                    </div>
                {/each}
            {/if}
        </div>
    </div>
{/if}

<!-- Модальне вікно підтвердження -->
{#if showConfirmModal}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="modal-overlay"
        on:click={cancelAlaraAction}
        on:keydown={handleModalKeydown}
        role="dialog"
        aria-modal="true"
    >
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="modal-content"
            class:dark={$themeStore === "dark"}
            class:light={$themeStore === "light"}
            on:click|stopPropagation
            role="document"
        >
            <h3>
                {confirmAction === "disable"
                    ? "Stop Alara for this chat?"
                    : "Turn on Alara for this chat?"}
            </h3>
            <p>
                {confirmAction === "disable"
                    ? "Alara will stop responding to messages in this chat"
                    : "Alara will start responding to messages in this chat again"}
            </p>
            <div class="modal-actions">
                <button class="cancel-button" on:click={cancelAlaraAction}>
                    Cancel
                </button>
                <button class="confirm-button" on:click={confirmAlaraAction}>
                    {confirmAction === "disable"
                        ? "Yes, turn off"
                        : "Yes, turn on"}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .chat-container {
        display: flex;
        flex-direction: column;
        flex: 1;
        position: relative;
        background-size: contain;
        background-position: center center;
        transition:
            background-color 0.3s ease,
            color 0.3s ease;
    }

    /* Темна тема */
    .chat-container.dark {
        color: #fff;
    }

    /* Світла тема */
    .chat-container.light {
        color: #1a1a1a;
    }

    /* Додаємо overlay для кращої читабельності тексту на зображеннях */
    .chat-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 0;
        transition: background 0.3s ease;
    }

    .chat-container.dark::before {
        background: rgba(0, 0, 0, 0.4);
    }

    .chat-container.light::before {
        background: rgba(255, 255, 255, 0.4);
    }

    /* Забезпечуємо, що весь контент знаходиться поверх overlay */
    .chat-header,
    .chat-content,
    .message-input-container {
        position: relative;
        z-index: 1;
    }

    .chat-container.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
    }

    .chat-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        border-bottom: 1px solid;
        transition:
            background-color 0.3s ease,
            border-color 0.3s ease;
    }

    .chat-container.dark .chat-header {
        border-bottom-color: #3b3b3b;
        background-color: #070709;
    }

    .chat-container.light .chat-header {
        border-bottom-color: #e5e5e5;
        background-color: #f9f9fb !important;
    }

    .back-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition:
            background-color 0.2s ease,
            color 0.3s ease;
    }

    .chat-container.dark .back-button {
        color: #fff;
    }

    .chat-container.light .back-button {
        color: #1a1a1a;
    }

    .chat-container.dark .back-button:hover {
        background-color: #444;
    }

    .chat-container.light .back-button:hover {
        background-color: #f0f0f0;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
    }

    .avatar {
        width: 30px;
        height: 30px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
    }

    .initials {
        font-size: 12px;
        font-weight: 600;
        color: #fff;
    }

    .user-details h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        transition: color 0.3s ease;
    }

    .chat-container.dark .user-details h2 {
        color: #fff;
    }

    .chat-container.light .user-details h2 {
        color: #1a1a1a;
    }

    .status {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
    }

    .status-text {
        font-size: 12px;
        transition: color 0.3s ease;
    }

    .chat-container.dark .status-text {
        color: #9b9ca3;
    }

    .chat-container.light .status-text {
        color: #6b7280;
    }

    .status-indicator {
        width: 8px;
        height: 8px;
        margin-top: 2px;
        border-radius: 50%;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .platform-badge {
        border: 1px solid;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 500;
        transition:
            border-color 0.3s ease,
            color 0.3s ease;
    }

    .chat-container.dark .platform-badge {
        border-color: #2b2b2b;
        color: #fff;
    }

    .chat-container.light .platform-badge {
        border-color: #d1d5db;
        color: #1a1a1a;
    }

    .fullscreen-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition:
            background-color 0.2s ease,
            color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .chat-container.dark .fullscreen-button {
        color: #fff;
    }

    .chat-container.light .fullscreen-button {
        color: #1a1a1a;
        background-color: #9d97c4;
    }

    .chat-container.dark .fullscreen-button:hover {
        background-color: #444;
    }

    .chat-container.light .fullscreen-button:hover {
        background-color: #453d80;
    }

    .chat-content {
        display: flex;
        flex: 1;
        position: relative;
        flex-direction: column;
        max-height: 100%;
        overflow-y: auto;
    }

    .messages-container {
        flex: 1;
        height: 100%;
        padding: 40px 80px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;

        scrollbar-width: none; /* Firefox: сховати скрол */
    }

    /* Приховати скролбар у WebKit браузерах */
    .messages-container::-webkit-scrollbar {
        width: 0;
        height: 0;
    }

    /* Приховати скролбар за замовчуванням */
    .messages-container::-webkit-scrollbar {
        width: 0;
    }

    /* Показати на hover */
    .messages-container:hover::-webkit-scrollbar {
        width: 8px;
    }

    /* Трек і повзунок */
    .messages-container::-webkit-scrollbar-track {
        background: #e6f0f3;
        border-radius: 4px;
    }

    .messages-container::-webkit-scrollbar-thumb {
        background-color: #0077b6;
        border-radius: 4px;
        border: 2px solid #e6f0f3;
    }

    .message {
        display: flex;
        gap: 14px;
        max-width: 56%;
        animation: fadeIn 0.3s ease-in-out;
    }

    .message.user {
        align-self: flex-start;
    }

    .message.bot {
        align-self: flex-end;
    }

    .message-content {
        padding: 12px 16px;
        border-radius: 10px;
        position: relative;
        flex: 1;
        transition: background-color 0.3s ease;
    }

    .chat-container.dark .message.user .message-content {
        background-color: #2a2a2a;
    }

    .chat-container.light .message.user .message-content {
        background-color: #f3f4f6;
    }

    .chat-container.dark .message.bot .message-content {
        background-color: #530549;
    }

    .chat-container.light .message.bot .message-content {
        background-color: #e7e5f4;
    }

    .message-content p {
        margin: 0;
        font-size: 14px;
        line-height: 1.4;
        margin-bottom: 4px;
        word-wrap: break-word;
        transition: color 0.3s ease;
    }

    .chat-container.dark .message-content p {
        color: #fff;
    }

    .chat-container.light .message-content p {
        color: #1a1a1a;
    }

    .timestamp {
        font-size: 11px;
        opacity: 0.7;
        transition: color 0.3s ease;
    }

    .chat-container.dark .timestamp {
        color: #9b9ca3;
    }

    .chat-container.light .timestamp {
        color: #6b7280;
    }

    .user-avatar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .loading-messages,
    .error-messages,
    .no-messages {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        gap: 16px;
        padding: 40px;
        text-align: center;
    }

    .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s linear infinite;
        transition: border-color 0.3s ease;
    }

    .chat-container.dark .loading-spinner {
        border-color: #444;
        border-top-color: transparent;
    }

    .chat-container.light .loading-spinner {
        border-color: #d1d5db;
        border-top-color: transparent;
    }

    .retry-button {
        background-color: #667eea;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s ease;
    }

    .retry-button:hover {
        background-color: #5a67d8;
    }

    .message-input-container {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 80px;
        border-top: 1px solid;
        transition:
            background-color 0.3s ease,
            border-color 0.3s ease;
    }

    .chat-container.dark .message-input-container {
        border: none;
    }

    .chat-container.light .message-input-container {
        border-top-color: #e5e5e5;
        background-color: #f9f9fb;
    }

    .message-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        transition:
            border-color 0.2s ease,
            background-color 0.3s ease,
            color 0.3s ease;
    }

    .chat-container.dark .message-input {
        background-color: #2a2a2a;
        border-color: #444;
        color: #fff;
    }

    .chat-container.light .message-input {
        background-color: #fff;
        border-color: #d1d5db;
        color: #1a1a1a;
    }

    .chat-container.dark .message-input::placeholder {
        color: #9b9ca3;
    }

    .chat-container.light .message-input::placeholder {
        color: #6b7280;
    }

    .chat-container.dark .message-input:focus {
        border-color: #667eea;
    }

    .chat-container.light .message-input:focus {
        border-color: #667eea;
    }

    .send-button,
    .history-button {
        background-color: var(--color-530549);
        color: white;
        border: none;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
        min-width: 44px;
        height: 44px;
    }

    .send-button:hover:not(:disabled),
    .history-button:hover {
        background-color: #800d70;
    }

    .send-button:disabled {
        background-color: var(--color-530549);
        cursor: not-allowed;
    }

    .history-panel {
        position: fixed;
        top: 0;
        right: -400px;
        width: 400px;
        height: 100vh;
        border-left: 1px solid;
        display: flex;
        flex-direction: column;
        transition:
            right 0.3s ease,
            background-color 0.3s ease,
            border-color 0.3s ease;
        z-index: 1001;
    }

    .history-panel.dark {
        background-color: #1a1a1a;
        border-left-color: #3b3b3b;
    }

    .history-panel.light {
        background-color: #fff;
        border-left-color: #e5e5e5;
    }

    .history-panel.show {
        right: 0;
    }

    .history-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 19.5px 20px;
        border-bottom: 1px solid;
        transition: border-color 0.3s ease;
    }

    .history-panel.dark .history-header {
        border-bottom-color: #3b3b3b;
    }

    .history-panel.light .history-header {
        border-bottom-color: #e5e5e5;
    }

    .alara-toggle-button {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .alara-toggle-button.enabled {
        background-color: #ef4444;
        color: white;
    }

    .alara-toggle-button.enabled:hover {
        background-color: #dc2626;
    }

    .alara-toggle-button.disabled {
        background-color: #10b981;
        color: white;
    }

    .alara-toggle-button.disabled:hover {
        background-color: #059669;
    }

    .close-history-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition:
            background-color 0.2s ease,
            color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .history-panel.dark .close-history-button {
        color: #fff;
    }

    .history-panel.light .close-history-button {
        color: #1a1a1a;
    }

    .history-panel.dark .close-history-button:hover {
        background-color: #444;
    }

    .history-panel.light .close-history-button:hover {
        background-color: #f0f0f0;
    }

    .history-content {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
    }

    .history-content h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        transition: color 0.3s ease;
    }

    .history-panel.dark .history-content h3 {
        color: #fff;
    }

    .history-panel.light .history-content h3 {
        color: #1a1a1a;
    }

    .no-history {
        font-size: 14px;
        opacity: 0.7;
        text-align: center;
        margin-top: 40px;
        transition: color 0.3s ease;
    }

    .history-panel.dark .no-history {
        color: #9b9ca3;
    }

    .history-panel.light .no-history {
        color: #6b7280;
    }

    .date-group {
        margin-bottom: 24px;
    }

    .date-header {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 12px;
        padding-bottom: 4px;
        border-bottom: 1px solid;
        transition:
            color 0.3s ease,
            border-color 0.3s ease;
    }

    .history-panel.dark .date-header {
        color: #9b9ca3;
        border-bottom-color: #3b3b3b;
    }

    .history-panel.light .date-header {
        color: #6b7280;
        border-bottom-color: #e5e5e5;
    }

    .history-message {
        margin-bottom: 12px;
        padding: 8px 12px;
        border-radius: 6px;
        transition: background-color 0.3s ease;
    }

    .history-panel.dark .history-message {
        background-color: #2a2a2a;
    }

    .history-panel.light .history-message {
        background-color: #f9f9fb;
    }

    .history-timestamp {
        font-size: 11px;
        opacity: 0.7;
        display: block;
        margin-bottom: 4px;
        transition: color 0.3s ease;
    }

    .history-panel.dark .history-timestamp {
        color: #9b9ca3;
    }

    .history-panel.light .history-timestamp {
        color: #6b7280;
    }

    .history-text {
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
        word-wrap: break-word;
        transition: color 0.3s ease;
    }

    .history-panel.dark .history-text {
        color: #fff;
    }

    .history-panel.light .history-text {
        color: #1a1a1a;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
        padding: 24px;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        animation: slideIn 0.2s ease-out;
        transition: background-color 0.3s ease;
    }

    .modal-content.dark {
        background-color: #1a1a1a;
        color: #fff;
    }

    .modal-content.light {
        background-color: #fff;
        color: #1a1a1a;
    }

    .modal-content h3 {
        margin: 0 0 12px 0;
        font-size: 18px;
        font-weight: 600;
    }

    .modal-content p {
        margin: 0 0 20px 0;
        font-size: 14px;
        line-height: 1.5;
        opacity: 0.8;
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }

    .cancel-button,
    .confirm-button {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .cancel-button {
        background-color: transparent;
        border: 1px solid;
        transition:
            background-color 0.2s ease,
            border-color 0.3s ease,
            color 0.3s ease;
    }

    .modal-content.dark .cancel-button {
        border-color: #444;
        color: #fff;
    }

    .modal-content.light .cancel-button {
        border-color: #d1d5db;
        color: #1a1a1a;
    }

    .modal-content.dark .cancel-button:hover {
        background-color: #444;
    }

    .modal-content.light .cancel-button:hover {
        background-color: #f9f9fb;
    }

    .confirm-button {
        background-color: #ef4444;
        color: white;
    }

    .confirm-button:hover {
        background-color: #dc2626;
    }

    .connection-status {
        position: absolute;
        top: 10px;
        right: 20px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10;
    }

    .connection-status.offline {
        background-color: #ef4444;
        color: white;
    }

    .typing-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        font-size: 12px;
        opacity: 0.7;
        animation: fadeIn 0.3s ease;
    }

    .typing-dots {
        display: flex;
        gap: 2px;
    }

    .typing-dots span {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: currentColor;
        animation: typingDot 1.4s infinite;
    }

    .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }

    .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes typingDot {
        0%,
        60%,
        100% {
            opacity: 0.3;
        }
        30% {
            opacity: 1;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes slideIn {
        from {
            transform: translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .messages-container {
            padding-left: 20px;
            padding-right: 20px;
        }

        .message {
            max-width: 85%;
        }

        .history-panel {
            width: 100%;
            right: -100%;
        }

        .chat-header {
            padding: 12px 16px;
        }

        .message-input-container {
            padding: 12px 16px;
        }

        .user-details h2 {
            font-size: 14px;
        }

        .platform-badge {
            display: none;
        }
    }

    @media (max-width: 480px) {
        .messages-container {
            padding-left: 12px;
            padding-right: 12px;
            padding-top: 20px;
            padding-bottom: 20px;
        }

        .message {
            max-width: 95%;
        }

        .message-content {
            padding: 10px 12px;
        }

        .message-content p {
            font-size: 13px;
        }

        .header-actions {
            gap: 8px;
        }

        .fullscreen-button {
            padding: 6px;
        }

        .modal-content {
            margin: 20px;
            padding: 20px;
        }
    }
</style>
