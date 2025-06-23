<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import imgChats from "../../lib/images/chats.png";
    import imgAnalyticss from "../../lib/images/analytics.png";
    import imgSettings from "../../lib/images/setting.png";
    import imgWidget from "../../lib/images/widget.png";

    $: currentPath = $page.url.pathname;

    // @ts-ignore
    function navigateTo(path) {
        goto(path);
    }
</script>

<div class="sidebar">
    <div
        class="block-bar chats {currentPath === '/chats' ? 'active' : ''}"
        on:click={() => navigateTo("/chats")}
        on:keydown={(e) => e.key === "Enter" && navigateTo("/chats")}
        role="button"
        tabindex="0"
    >
        <img src={imgChats} alt="Chats" />
    </div>
    <div
        class="block-bar analyt {currentPath === '/analytics' ? 'active' : ''}"
        on:click={() => navigateTo("/analytics")}
        on:keydown={(e) => e.key === "Enter" && navigateTo("/analytics")}
        role="button"
        tabindex="0"
    >
        <img src={imgAnalyticss} alt="Analytics" />
    </div>
    <!--
 <div
        class="block-bar settings {currentPath === '/widgets' ? 'active' : ''}"
        on:click={() => navigateTo("/widgets")}
        on:keydown={(e) => e.key === "Enter" && navigateTo("/widgets")}
        role="button"
        tabindex="0"
    >
        <img src={imgWidget} alt="Widget" />
    </div>
-->
    <div
        class="block-bar settings {currentPath === '/settings' ? 'active' : ''}"
        on:click={() => navigateTo("/settings")}
        on:keydown={(e) => e.key === "Enter" && navigateTo("/settings")}
        role="button"
        tabindex="0"
    >
        <img src={imgSettings} alt="Settings" />
    </div>
</div>

<style>
    .sidebar {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 60px;
        padding-top: 2%;
        border-right: 1px solid var(--color-232426);
        align-items: center;
        background-color: var(--color-070709);
    }

    .block-bar {
        width: 100%;
        max-width: 40px;
        height: 100%;
        max-height: 40px;
        background-color: var(--color-262629);
        border-radius: 4px;
        margin-bottom: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .block-bar:hover {
        background-color: var(--color-232426);
    }

    .block-bar.active {
        background-color: var(--color-530549);
    }

    .block-bar img {
        width: 20px;
        height: 20px;
    }

    /* Світла тема */
    [data-theme="light"] .sidebar {
        background-color: var(--color-fff);
        border-right-color: var(--color-e9ecef);
    }

    [data-theme="light"] .block-bar {
        background-color: var(--color-f8f9fa);
    }

    [data-theme="light"] .block-bar:hover {
        background-color: var(--color-e9ecef);
    }

    [data-theme="light"] .block-bar.active {
        background-color: var(--color-3b82f6);
    }

    /* Темна тема */
    [data-theme="dark"] .sidebar {
        background-color: var(--color-070709);
        border-right-color: var(--color-232426);
    }

    [data-theme="dark"] .block-bar {
        background-color: var(--color-121213);
    }

    [data-theme="dark"] .block-bar:hover {
        background-color: var(--color-232426);
    }

    [data-theme="dark"] .block-bar.active {
        background-color: var(--color-530549);
    }

    /* Адаптивність для великих ноутбуків */
    @media (max-width: 1440px) {
        .sidebar {
            max-width: 65px;
            padding-top: 1.8%;
        }

        .block-bar {
            max-width: 42px;
            max-height: 42px;
            margin-bottom: 16px;
        }

        .block-bar img {
            width: 18px;
            height: 18px;
        }
    }

    /* Адаптивність для стандартних ноутбуків */
    @media (max-width: 1366px) {
        .sidebar {
            max-width: 60px;
            padding-top: 1.5%;
        }

        .block-bar {
            max-width: 38px;
            max-height: 38px;
            margin-bottom: 14px;
        }

        .block-bar img {
            width: 16px;
            height: 16px;
        }
    }

    /* Адаптивність для менших ноутбуків */
    @media (max-width: 1280px) {
        .sidebar {
            max-width: 55px;
            padding-top: 1.2%;
        }

        .block-bar {
            max-width: 36px;
            max-height: 36px;
            margin-bottom: 12px;
        }

        .block-bar img {
            width: 15px;
            height: 15px;
        }
    }

    @media (max-width: 1024px) {
        .sidebar {
            max-width: 50px;
            padding-top: 1%;
        }

        .block-bar {
            max-width: 34px;
            max-height: 34px;
            margin-bottom: 10px;
        }

        .block-bar img {
            width: 14px;
            height: 14px;
        }
    }

    /* Адаптивність для планшетів та мобільних */
    @media (max-width: 768px) {
        .sidebar {
            flex-direction: row;
            max-width: 100%;
            width: 100%;
            height: auto;
            padding: 12px;
            border-right: none;
            border-bottom: 1px solid var(--color-232426);
            justify-content: center;
            gap: 8px;
        }

        .block-bar {
            max-width: 40px;
            max-height: 40px;
            margin-bottom: 0;
            flex-shrink: 0;
        }

        .block-bar img {
            width: 16px;
            height: 16px;
        }

        [data-theme="light"] .sidebar {
            border-bottom-color: var(--color-e9ecef);
        }

        [data-theme="dark"] .sidebar {
            border-bottom-color: var(--color-232426);
        }
    }

    @media (max-width: 480px) {
        .sidebar {
            padding: 8px;
            gap: 6px;
        }

        .block-bar {
            max-width: 36px;
            max-height: 36px;
        }

        .block-bar img {
            width: 14px;
            height: 14px;
        }
    }

    /* Фокус для доступності */
    .block-bar:focus {
        outline: 2px solid var(--color-3b82f6);
        outline-offset: 2px;
    }

    [data-theme="dark"] .block-bar:focus {
        outline-color: var(--color-530549);
    }
</style>
