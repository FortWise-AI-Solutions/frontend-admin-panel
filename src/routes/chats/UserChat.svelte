<script lang="ts">
    import type { User } from "../../lib/types/type";
    import iconFC from "../../lib/images/full-screen-on.png";
    import iconSC from "../../lib/images/full-screen-off.png";
    import hisIcon from "../../lib/images/history.png";

    export let selectedUser: User;
    export let onBackToList: () => void = () => {};
    export let onToggleFullscreen: () => void = () => {};
    export let isFullscreen: boolean = false;
    export let backgroundImage: string | null = null;

    // Типи для повідомлень
    interface Message {
        id: number;
        text: string;
        sender: "user" | "bot";
        timestamp: string;
        date: string;
    }

    // Статуси та їх кольори
    const statusConfig: Record<string, { color: string; label: string }> = {
        "on-going": { color: "#4DE944", label: "Online" },
        offline: { color: "#E94447", label: "Offline" },
        "human-required": { color: "#E9D644", label: "Human Required" },
        "no-info": { color: "#6b7280", label: "No Info" },
    };

    // Генерація градієнта для аватара (точно така ж як в UserSelect)
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

    // Кешування градієнтів для кожного користувача (точно така ж логіка як в UserSelect)
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

    // Повідомлення та функціонал чату
    let messages: Message[] = [
        {
            id: 1,
            text: "Hello! I need help with my order. Can you please check the status?",
            sender: "user",
            timestamp: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
            date: new Date().toLocaleDateString("en-US"),
        },
        {
            id: 2,
            text: "Of course! I'd be happy to help you check your order status. Could you please provide me with your order number?",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
            date: new Date().toLocaleDateString("en-US"),
        },
        {
            id: 3,
            text: "My order number is #12345. I placed it yesterday.",
            sender: "user",
            timestamp: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
            date: new Date().toLocaleDateString("en-US"),
        },
        {
            id: 4,
            text: "Thank you for providing the order number. Let me check that for you.",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
            date: new Date().toLocaleDateString("en-US"),
        },
    ];

    let newMessage: string = "";
    let messagesContainer: HTMLElement;

    // Стан для історії та Алари
    let showHistory: boolean = false;
    let isAlaraEnabled: boolean = true;
    let showConfirmModal: boolean = false;
    let confirmAction: "enable" | "disable" | null = null;

    // Функція для відправки повідомлення
    function sendMessage(): void {
        if (newMessage.trim() === "") return;

        const message: Message = {
            id: messages.length + 1,
            text: newMessage.trim(),
            sender: "user",
            timestamp: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
            date: new Date().toLocaleDateString("en-US"),
        };

        messages = [...messages, message];
        newMessage = "";

        // Прокрутка до низу після додавання повідомлення
        setTimeout(() => {
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 10);

        // Симуляція відповіді бота через 1-2 секунди (тільки якщо Алара увімкнена)
        if (isAlaraEnabled) {
            setTimeout(
                () => {
                    const botResponse: Message = {
                        id: messages.length + 1,
                        text: "Thank you for your message. I'm processing your request...",
                        sender: "bot",
                        timestamp: new Date().toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        }),
                        date: new Date().toLocaleDateString("en-US"),
                    };
                    messages = [...messages, botResponse];

                    setTimeout(() => {
                        if (messagesContainer) {
                            messagesContainer.scrollTop =
                                messagesContainer.scrollHeight;
                        }
                    }, 10);
                },
                Math.random() * 1000 + 1000,
            );
        }
    }

    // Обробка натискання Enter
    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
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

    $: userMessages = getUserMessages();
    $: groupedMessages = groupMessagesByDate(userMessages);

    // Функція для отримання стилю фону з додатковими опціями
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
        return "background-color: #1a1a1a;";
    }
</script>

<div
    class="chat-container"
    class:fullscreen={isFullscreen}
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
                <h2>{selectedUser.nickname}</h2>
                <div class="status">
                    <span class="status-text"
                        >{statusConfig[selectedUser.status]?.label ||
                            "Unknown"}</span
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
            {#each messages as message (message.id)}
                <div class="message {message.sender}">
                    <!-- Аватар зліва для повідомлень бота -->
                    {#if message.sender === "bot"}
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

                    <!-- Аватар справа для повідомлень користувача -->
                    {#if message.sender === "user"}
                        <div class="avatar user-avatar"></div>
                    {/if}
                </div>
            {/each}
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
        />
        <button
            class="send-button"
            on:click={sendMessage}
            disabled={newMessage.trim() === ""}
            aria-label="Send message"
        >
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
</div>

<!-- Панель історії -->
{#if showHistory}
    <div class="history-panel" class:show={showHistory}>
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
        <div class="modal-content" on:click|stopPropagation role="document">
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
        color: #fff;
        flex: 1;
        position: relative;
        background-size: contain;
        background-position: center center;
    }

    /* Додаємо overlay для кращої читабельності тексту на зображеннях */
    .chat-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        pointer-events: none;
        z-index: 0;
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
        border-bottom: 1px solid #3b3b3b;
        background-color: #070709;
    }

    .back-button {
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
    }

    .back-button:hover {
        background-color: #444;
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
        color: #fff;
    }

    .status {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
    }

    .status-text {
        font-size: 12px;
        color: #9b9ca3;
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
        border: 1px solid #2b2b2b;
        border-radius: 4px;
        color: #fff;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 500;
    }

    .fullscreen-button {
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .fullscreen-button:hover {
        background-color: #444;
    }

    .chat-content {
        display: flex;
        flex: 1;
        position: relative;
    }

    .messages-container {
        flex: 1;
        padding-top: 40px;
        padding-bottom: 40px;
        padding-left: 120px;
        padding-right: 120px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .message {
        display: flex;
        gap: 14px;
        max-width: 56%;
        animation: fadeIn 0.3s ease-in-out;
    }

    .message.user {
        align-self: flex-end;
    }

    .message.bot {
        align-self: flex-start;
    }

    .message-content {
        background-color: #333;
        padding: 12px 16px;
        border-radius: 10px;
        position: relative;
        flex: 1;
    }

    .message.user .message-content {
        background-color: #530549;
    }

    .message.bot .message-content {
        background-color: #2a2a2a;
    }

    .message-content p {
        margin: 0;
        font-size: 14px;
        line-height: 1.4;
        margin-bottom: 4px;
        word-wrap: break-word;
    }

    .timestamp {
        font-size: 11px;
        color: #9b9ca3;
        display: block;
        text-align: right;
    }

    .message.bot .timestamp {
        text-align: left;
    }

    .message-input-container {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 40px 120px;
    }

    .message-input {
        flex: 1;
        background-color: #1a1a1a;
        border: 1px solid #444;
        border-radius: 8px;
        padding: 12px 40px;
        color: #fff;
        font-size: 14px;
        resize: none;
        min-height: 20px;
        max-height: 100px;
    }

    .message-input:focus {
        outline: none;
        border-color: #ffffff;
    }

    .message-input::placeholder {
        color: #9b9ca3;
    }

    .send-button {
        background-color: #530549;
        border: none;
        border-radius: 8px;
        padding: 12px;
        color: #fff;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .send-button:hover:not(:disabled) {
        background-color: #6a0660;
    }

    .send-button:disabled {
        background-color: #333;
        cursor: not-allowed;
        opacity: 0.5;
    }

    .history-button {
        background-color: #272727;
        border: none;
        border-radius: 8px;
        padding: 12px;
        color: #fff;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .history-button:hover:not(:disabled) {
        background-color: #6a0660;
    }

    .history-button:disabled {
        background-color: #333;
        cursor: not-allowed;
        opacity: 0.5;
    }

    /* Панель історії */
    .history-panel {
        position: fixed;
        top: 0;
        right: -400px;
        width: 500px;
        height: 100%;
        background-color: #2a2a2a;
        display: flex;
        flex-direction: column;
        z-index: 2000;
        transition: right 0.3s ease-in-out;
        box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
    }

    .history-panel.show {
        right: 0;
    }

    .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        height: 39px;
        border-bottom: 1px solid #3b3b3b;
        background-color: #070709;
    }

    .alara-toggle-button {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .alara-toggle-button.enabled {
        background-color: #530505;
        color: #fff;
    }

    .alara-toggle-button.disabled {
        background-color: #095305;
        color: #fff;
    }

    .alara-toggle-button:hover {
        opacity: 0.8;
    }

    .close-history-button {
        background: none;
        border: none;
        color: #9b9ca3;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }

    .close-history-button:hover {
        background-color: #444;
        color: #fff;
    }

    .history-content {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
    }

    .history-content h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        color: #fff;
    }

    .date-group {
        margin-bottom: 20px;
    }

    .date-header {
        font-size: 12px;
        color: #cecece;
        margin-bottom: 16px;
        padding-bottom: 4px;
        border-bottom: 1px solid #3b3b3b;
    }

    .history-message {
        margin-bottom: 12px;
        padding: 8px 12px;
        background-color: #1a1a1a;
        border-radius: 6px;
    }

    .history-timestamp {
        font-size: 10px;
        color: #9b9ca3;
        display: block;
        margin-bottom: 4px;
    }

    .history-text {
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
        color: #fff;
    }

    /* Модальне вікно */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        backdrop-filter: blur(4px);
    }

    .modal-content {
        background-color: #131416;
        padding: 24px;
        border-radius: 12px;
        max-width: 400px;
        
        width: 90%;
        border: 1px solid #3b3b3b;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }

    .modal-content h3 {
        margin: 0 0 12px 0;
        font-size: 18px;
        color: #fff;
    }

    .modal-content p {
        margin: 0 0 20px 0;
        font-size: 14px;
        color: #9b9ca3;
        line-height: 1.4;
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        margin-top: 70px;
        justify-content: flex-end;
    }

    .confirm-button {
        background-color: #8a0778;
        color: #fff;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .confirm-button:hover {
        background-color: #6a0660;
    }

    .cancel-button {
        background-color: #232426;
        color: #fff;
        border: #35363A 1px solid;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .cancel-button:hover {
        background-color: #555;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Скролбар для повідомлень */
    .messages-container::-webkit-scrollbar,
    .history-content::-webkit-scrollbar {
        width: 6px;
    }

    .messages-container::-webkit-scrollbar-track,
    .history-content::-webkit-scrollbar-track {
        background: #2a2a2a;
        border-radius: 3px;
    }

    .messages-container::-webkit-scrollbar-thumb,
    .history-content::-webkit-scrollbar-thumb {
        background: #444;
        border-radius: 3px;
    }

    .messages-container::-webkit-scrollbar-thumb:hover,
    .history-content::-webkit-scrollbar-thumb:hover {
        background: #555;
    }

    .user-avatar {
        background-image: url("../../lib/images/alara.png");
        background-position: center;
        background-size: cover;
    }

    /* Адаптивність */
    @media (max-width: 768px) {
        .chat-header {
            padding: 12px 16px;
        }

        .header-actions {
            gap: 8px;
        }

        .platform-badge {
            display: none;
        }

        .message {
            max-width: 85%;
        }

        .messages-container {
            padding: 16px;
        }

        .message-input-container {
            padding: 12px 16px;
        }

        .history-panel {
            width: 100%;
            right: -100%;
        }

        .history-panel.show {
            right: 0;
        }
    }

    @media (max-width: 480px) {
        .messages-container {
            padding: 12px;
        }

        .message-input-container {
            padding: 8px 12px;
        }

        .message-input {
            padding: 10px 16px;
        }

        .send-button,
        .history-button {
            padding: 10px;
        }

        .modal-content {
            margin: 16px;
            padding: 20px;
        }

        .modal-actions {
            flex-direction: column;
        }

        .confirm-button,
        .cancel-button {
            width: 100%;
        }
    }
</style>
