<script>
    import added from "../../lib/images/widgets/added.png";
    import cloud from "../../lib/images/widgets/cloud.png";
    import download from "../../lib/images/widgets/download.png";

    // Стан вибраних віджетів та алар
    let selectedWidgets = new Set();
    /**
     * @type {string | null}
     */
    let selectedAlarea = null; // Тільки один вибраний алара

    // Скрол функції
    /**
     * @type {HTMLDivElement}
     */
    let scrollContainer;

    function scrollToTop() {
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }

    function scrollToBottom() {
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: "smooth",
            });
        }
    }

    // Відстеження позиції скролу
    let showScrollButtons = false;
    let isAtTop = true;
    let isAtBottom = false;

    function handleScroll() {
        if (scrollContainer) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

            isAtTop = scrollTop === 0;
            isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
            showScrollButtons = scrollHeight > clientHeight;
        }
    }

    // Функції вибору
    /**
     * @param {string} widgetId
     */
    function toggleWidget(widgetId) {
        if (selectedWidgets.has(widgetId)) {
            selectedWidgets.delete(widgetId);
        } else {
            selectedWidgets.add(widgetId);
        }
        selectedWidgets = selectedWidgets; // Trigger reactivity
    }

    /**
     * @param {string} alaraId
     */
    function selectAlarea(alaraId) {
        selectedAlarea = selectedAlarea === alaraId ? null : alaraId;
    }

    // Дані віджетів та алар
    const widgets = [
        { id: "widget-1", name: "Search Function", class: "one" },
        { id: "widget-2", name: "Widget #2", class: "two" },
        { id: "widget-3", name: "Widget #3", class: "three" },
        { id: "widget-4", name: "Widget #4", class: "four" },
    ];

    const alareas = [
        { id: "alara-1", name: "Alara #1", class: "one" },
        { id: "alara-2", name: "Alara #2", class: "two" },
        { id: "alara-3", name: "Alara #3", class: "three" },
        { id: "alara-4", name: "Alara #4", class: "four" },
    ];
</script>

<div class="widgets-container">
    <!-- Кнопка скролу вверх -->
    {#if showScrollButtons && !isAtTop}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button
            class="scroll-button scroll-up"
            on:click={scrollToTop}
            title="Scroll to top"
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M7 14L12 9L17 14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </button>
    {/if}

    <div
        class="scroll-content"
        bind:this={scrollContainer}
        on:scroll={handleScroll}
    >
        <!-- Widgets Section -->
        <div class="wid-container">
            <h1>Your Widgets</h1>
            <div class="chat-list">
                <p>
                    Choose across multiple widgets to find the best solution you
                    need
                </p>
            </div>
            <div class="array">
                {#each widgets as widget}
                    <div
                        class="widget-card"
                        class:selected={selectedWidgets.has(widget.id)}
                        on:click={() => toggleWidget(widget.id)}
                        role="button"
                        tabindex="0"
                        on:keydown={(e) =>
                            e.key === "Enter" && toggleWidget(widget.id)}
                    >
                        <div class="widget-header {widget.class}">
                            <img
                                src={selectedWidgets.has(widget.id)
                                    ? added
                                    : download}
                                alt="Widget Icon"
                                class="icon-top"
                            />
                        </div>
                        <div class="widget-footer">
                            <h2>{widget.name}</h2>
                            <img
                                src={cloud}
                                alt="Check Icon"
                                class="icon-bottom"
                            />
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Alarea Section -->
        <div class="wid-container">
            <h1>Your Alarea</h1>
            <div class="chat-list">
                <p>
                    Choose across multiple characters to create the best bot you
                    need
                </p>
            </div>
            <div class="array">
                {#each alareas as alara}
                    <div
                        class="widget-card"
                        class:selected={selectedAlarea === alara.id}
                        on:click={() => selectAlarea(alara.id)}
                        role="button"
                        tabindex="0"
                        on:keydown={(e) =>
                            e.key === "Enter" && selectAlarea(alara.id)}
                    >
                        <div class="widget-header {alara.class}">
                            <img
                                src={selectedAlarea === alara.id
                                    ? added
                                    : download}
                                alt="Alara Icon"
                                class="icon-top"
                            />
                        </div>
                        <div class="widget-footer">
                            <h2>{alara.name}</h2>
                            <img
                                src={cloud}
                                alt="Check Icon"
                                class="icon-bottom"
                            />
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- Кнопка скролу вниз -->
    {#if showScrollButtons && !isAtBottom}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button
            class="scroll-button scroll-down"
            on:click={scrollToBottom}
            title="Scroll to bottom"
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M7 10L12 15L17 10"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </button>
    {/if}
</div>

<style>
    .widgets-container {
        position: relative;
        height: 100vh;
        overflow: hidden;
    }

    .scroll-content {
        height: 100%;
        overflow-y: auto;
        padding-right: 8px;
    }

    .scroll-button {
        position: fixed;
        right: 24px;
        z-index: 1000;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background-color: var(--color-530549);
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .scroll-button:hover {
        background-color: var(--color-232426);
        transform: scale(1.1);
    }

    .scroll-up {
        top: 24px;
    }

    .scroll-down {
        bottom: 24px;
    }

    .wid-container {
        color: var(--color-fff);
        padding: 4.2% 5% 2%;
    }

    h1 {
        font-size: 30px;
        font-weight: 500;
        margin: 0 0 25px 0;
    }

    .chat-list p {
        font-size: 14px;
        color: var(--color-9b9ca3);
        margin: 0;
        font-weight: 500;
    }

    .array {
        margin-top: 45px;
        gap: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        max-width: 1200px;
    }

    .widget-card {
        width: 100%;
        height: 250px;
        border-radius: 10px;
        background-color: var(--color-121214);
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
       
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
    }

    .widget-card:hover {
        border-color: var(--color-530549);
    }

    .widget-card.selected {
        border-color: #4de944;
    }

    .widget-header {
        position: relative;
        flex: 1;
        border-radius: 10px 10px 0 0;
        border-radius: 10px;
    }

    .widget-header.one {
        background-image: url("../../lib/images/widgets/widget-1.png");
        background-position: center;
        background-size: cover;
    }

    .widget-header.two {
        background-image: url("../../lib/images/widgets/widget-2.png");
        background-position: center;
        background-size: cover;
    }

    .widget-header.three {
        background-image: url("../../lib/images/widgets/widget-3.png");
        background-position: center;
        background-size: cover;
    }

    .widget-header.four {
        background-image: url("../../lib/images/widgets/widget-4.png");
        background-position: center;
        background-size: cover;
    }

    .icon-top {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 20px;
        height: 20px;
        z-index: 2;
        transition: all 0.3s ease;
    }

    .widget-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--color-fff);
        padding: 12px;
        background-color: var(--color-121214);
    }

    .widget-footer h2 {
        font-size: 16px;
        font-weight: 500;
        margin: 0;
    }

    .icon-bottom {
        width: 16px;
        height: 16px;
    }

    /* Скролбар */
    .scroll-content::-webkit-scrollbar {
        width: 8px;
    }

    .scroll-content::-webkit-scrollbar-track {
        background: var(--color-131416);
        border-radius: 4px;
    }

    .scroll-content::-webkit-scrollbar-thumb {
        background: var(--color-232426);
        border-radius: 4px;
    }

    .scroll-content::-webkit-scrollbar-thumb:hover {
        background: var(--color-9b9ca3);
    }

    /* Адаптивність для ноутбуків */
    @media (max-width: 1400px) {
        .array {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
        }

        .widget-card {
            height: 220px;
        }

        h1 {
            font-size: 26px;
        }
    }

    @media (max-width: 1200px) {
        .wid-container {
            padding: 3% 4% 2%;
        }

        .array {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 14px;
        }

        .widget-card {
            height: 200px;
        }

        h1 {
            font-size: 24px;
        }
    }

    @media (max-width: 992px) {
        .array {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }

        .widget-card {
            height: 180px;
        }

        .scroll-button {
            width: 36px;
            height: 36px;
            right: 16px;
        }

        .scroll-up {
            top: 16px;
        }

        .scroll-down {
            bottom: 16px;
        }
    }

    @media (max-width: 768px) {
        .wid-container {
            padding: 2% 3% 1.5%;
        }

        .array {
            grid-template-columns: 1fr;
            gap: 10px;
        }

        .widget-card {
            height: 160px;
        }

        h1 {
            font-size: 22px;
        }

        .chat-list p {
            font-size: 13px;
        }

        .widget-footer h2 {
            font-size: 14px;
        }

        .scroll-button {
            width: 32px;
            height: 32px;
            right: 12px;
        }

        .scroll-up {
            top: 12px;
        }

        .scroll-down {
            bottom: 12px;
        }
    }

    @media (max-width: 480px) {
        .wid-container {
            padding: 1.5% 2% 1%;
        }

        .array {
            margin-top: 30px;
            gap: 8px;
        }

        .widget-card {
            height: 140px;
        }

        h1 {
            font-size: 20px;
            margin-bottom: 15px;
        }

        .chat-list p {
            font-size: 12px;
        }

        .widget-footer {
            padding: 8px;
        }

        .widget-footer h2 {
            font-size: 13px;
        }

        .icon-top {
            width: 16px;
            height: 16px;
            top: 8px;
            right: 8px;
        }

        .icon-bottom {
            width: 14px;
            height: 14px;
        }
    }

    /* Додаткові стилі для великих екранів */
    @media (min-width: 1500px) {
        .array {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
            max-width: 1400px;
        }

        .widget-card {
            height: 280px;
        }

        h1 {
            font-size: 32px;
        }

        .chat-list p {
            font-size: 15px;
        }

        .widget-footer h2 {
            font-size: 18px;
        }
    }

    /* Стилі для фокусу (доступність) */
    .widget-card:focus {
        outline: 2px solid #4de944;
        outline-offset: 2px;
    }

    .widget-card:focus:not(:focus-visible) {
        outline: none;
    }

    /* Темна тема */
    [data-theme="dark"] .widget-card {
        background: #1a1a1b;
    }

    [data-theme="dark"] .widget-footer {
        background: #1a1a1b;
    }

    [data-theme="dark"] .scroll-button {
        background-color: #2d2d30;
    }

    [data-theme="dark"] .scroll-button:hover {
        background-color: #3e3e42;
    }

    /* Світла тема */
    [data-theme="light"] .widget-card {
        background: #ffffff;
       
    }

    [data-theme="light"] .widget-footer {
        background: #ffffff;
        color: #333;
    }

    [data-theme="light"] .widget-card:hover {
      
        border-color: #007bff;
    }

    [data-theme="light"] .widget-card.selected {
        border-color: #28a745;
    }

    [data-theme="light"] .scroll-button {
        background-color: #007bff;
    }

    [data-theme="light"] .scroll-button:hover {
        background-color: #0056b3;
    }

    /* Плавні переходи для всіх інтерактивних елементів */
    .widget-card,
    .scroll-button,
    .icon-top {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Покращення доступності */
    @media (prefers-reduced-motion: reduce) {
        .widget-card,
        .scroll-button,
        .icon-top {
            transition: none;
        }

        .widget-card:hover {
            transform: none;
        }
    }

    /* Стилі для високої контрастності */
    @media (prefers-contrast: high) {
        .widget-card {
            border-width: 3px;
        }

        .widget-card.selected {
            border-color: #00ff00;
        }

        .scroll-button {
            border: 2px solid #ffffff;
        }
    }

    /* Додаткові стилі для кращого UX */
    .widget-card:active {
        transform: scale(0.98);
    }

    .icon-top:hover {
        transform: scale(1.1);
    }

    /* Стилі для завантаження */
    .widget-card.loading {
        opacity: 0.7;
        pointer-events: none;
    }

    .widget-card.loading::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid #4de944;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    /* Стилі для помилок */
    .widget-card.error {
        border-color: #e74c3c;
        background-color: rgba(231, 76, 60, 0.1);
    }

    .widget-card.error:hover {
        border-color: #c0392b;
    }

    /* Стилі для відключених карток */
    .widget-card.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }

    /* Покращення візуального зворотного зв'язку */
    .widget-card.selected .icon-top {
        filter: brightness(1.2);
    }

    /* Стилі для мобільних пристроїв з дотиком */
    @media (hover: none) and (pointer: coarse) {
        .widget-card:hover {
            transform: none;
            border-color: transparent;
        }

        .widget-card:active {
            transform: scale(0.95);
            border-color: var(--color-530549);
        }

        .widget-card.selected:active {
            border-color: #4de944;
        }
    }

    /* Анімація появи карток */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .widget-card {
        animation: fadeInUp 0.5s ease-out;
    }

    /* Затримка анімації для кожної картки */
    .widget-card:nth-child(1) {
        animation-delay: 0.1s;
    }
    .widget-card:nth-child(2) {
        animation-delay: 0.2s;
    }
    .widget-card:nth-child(3) {
        animation-delay: 0.3s;
    }
    .widget-card:nth-child(4) {
        animation-delay: 0.4s;
    }




    .icon-bottom {
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    }
</style>
