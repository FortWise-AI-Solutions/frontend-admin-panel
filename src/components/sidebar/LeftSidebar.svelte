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

    <div
        class="block-bar settings {currentPath === '/widgets' ? 'active' : ''}"
        on:click={() => navigateTo("/widgets")}
        on:keydown={(e) => e.key === "Enter" && navigateTo("/settings")}
        role="button"
        tabindex="0"
    >
        <img src={imgWidget} alt="Widget" />
    </div>

    <div
        class="block-bar settings {currentPath === '/settings' ? 'active' : ''}"
        on:click={() => navigateTo("/settings")}
        on:keydown={(e) => e.key === "Enter" && navigateTo("/settings")}
        role="button"
        tabindex="0"
    >
        <img src={imgSettings} alt="Settings" />
    </div>

    <!--  <div
        class="block-bar widget-1 {currentPath === '/widget-1' ? 'active' : ''}"
        on:click={() => navigateTo("/widget-1")}
        on:keydown={(e) => e.key === "Enter" && navigateTo("/widget-1")}
        role="button"
        tabindex="0"
    >
        <img src={Widget1} alt="Search" />
    </div>-->
</div>

<style>
    .sidebar {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 80px;
        padding-top: 2%;
        border-right: #3b3b3b 1px solid;
        align-items: center;
    }

    .block-bar {
        width: 100%;
        max-width: 50px;
        height: 100%;
        max-height: 50px;
        background-color: #121213;
        border-radius: 4px;
        margin-bottom: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .block-bar:hover {
        background-color: #2a2a2b;
    }

    .block-bar.active {
        background-color: #530549;
    }

    .block-bar img {
        width: 20px;
        height: 20px;
    }
</style>
