<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import imgSetBg from "../../lib/images/bg-set.png";
    import darkTheme from "../../lib/images/dark-theme.png";
    import brightTheme from "../../lib/images/white-theme.png";

    const dispatch = createEventDispatcher<{
        backgroundChange: { backgroundImage: string | null };
    }>();

    let fileInput: HTMLInputElement;
    let currentBackground: string | null = null;

    onMount(() => {
        // Завантажуємо збережений фон при ініціалізації
        const saved = localStorage.getItem("chatBackgroundImage");
        if (saved) {
            currentBackground = saved;
            dispatch("backgroundChange", { backgroundImage: saved });
        }
    });

    function handleFileSelect(): void {
        fileInput.click();
    }

    function handleFileChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target?.result && typeof e.target.result === "string") {
                    const imageData = e.target.result;
                    currentBackground = imageData;

                    // Зберігаємо в localStorage
                    localStorage.setItem("chatBackgroundImage", imageData);

                    // Відправляємо подію до батьківського компонента
                    dispatch("backgroundChange", {
                        backgroundImage: imageData,
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    }

    function removeBackground(): void {
        currentBackground = null;
        localStorage.removeItem("chatBackgroundImage");
        dispatch("backgroundChange", { backgroundImage: null });
    }
</script>

<div class="set-container">
    <h1>Settings</h1>
    <div class="chat-list">
        <p>
            Choose across multiple settings to find the best solution you need
        </p>
    </div>

    <div class="settings-section">
        <h2>Chat Background</h2>
        <div class="set-array">
            <div
                class="block-set"
                on:click={handleFileSelect}
                on:keydown={(e) => e.key === "Enter" && handleFileSelect()}
                role="button"
                tabindex="0"
                aria-label="Upload background image"
            >
                <div class="background-preview">
                    {#if currentBackground}
                        <img
                            src={currentBackground}
                            alt="Current background"
                            class="preview-image"
                        />
                        <div class="overlay">
                            <span>Change Image</span>
                        </div>
                    {:else}
                        <img
                            src={imgSetBg}
                            alt="Upload background"
                            class="img-inner"
                        />
                    {/if}
                </div>
                <div class="set-description">
                    <p>
                        {currentBackground
                            ? "Change Background"
                            : "Set Background"}
                    </p>
                </div>
            </div>

            {#if currentBackground}
                <div
                    class="block-set remove-bg"
                    on:click={removeBackground}
                    on:keydown={(e) => e.key === "Enter" && removeBackground()}
                    role="button"
                    tabindex="0"
                    aria-label="Remove background image"
                >
                    <div class="background-preview remove-preview">
                        <svg
                            width="60"
                            height="60"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M18 6L6 18M6 6L18 18"
                                stroke="#ff4444"
                                stroke-width="2"
                                stroke-linecap="round"
                            />
                        </svg>
                    </div>
                    <div class="set-description">
                        <p>Remove Background</p>
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <div class="settings-section">
        <h2>Change Themes</h2>
        <div class="set-array">
            <div class="block-set">
                <div class="background-preview">
                    <img src={darkTheme} alt="Dark Theme" class="img-inner" />
                </div>
                <div class="set-description">
                    <p>Dark Theme</p>
                </div>
            </div>

            <div class="block-set">
                <div class="background-preview">
                    <img
                        src={brightTheme}
                        alt="Bright Theme"
                        class="img-inner"
                    />
                </div>
                <div class="set-description">
                    <p>Bright Theme</p>
                </div>
            </div>
        </div>
    </div>
</div>

<input
    type="file"
    accept="image/*"
    bind:this={fileInput}
    on:change={handleFileChange}
    style="display: none;"
/>

<style>
    .set-container {
        color: #fff;
        padding-top: 4.2%;
        padding-left: 5%;
        padding-right: 5%;
    }

    h1 {
        font-size: 30px;
        margin-bottom: 10px;
    }

    h2 {
        font-size: 20px;
        font-weight: 500;
        margin-bottom: 20px;
        color: #fff;
    }

    .chat-list p {
        font-size: 14px;
        color: #9b9ca3;
        margin-top: 25px;
        font-weight: 500;
    }

    .settings-section {
        margin-top: 40px;
    }

    .set-array {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-top: 20px;
    }

    .block-set {
        width: 220px;
        height: 220px;
        background-color: #121213;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        overflow: hidden;
        position: relative;
    }

    .block-set:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(83, 5, 73, 0.3);

    }

    .block-set:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(83, 5, 73, 0.2);
    }

    .block-set.remove-bg:hover {
        border-color: #ff4444;
        box-shadow: 0 10px 25px rgba(255, 68, 68, 0.3);
    }

    .background-preview {
        width: 100%;
        height: 180px;
        border-radius: 8px 8px 0 0;
        position: relative;
        overflow: hidden;
    }

    .background-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
    }

    .block-set:hover .overlay {
        opacity: 1;
    }

    .img-inner {
        border-radius: 10px;
    }

    .remove-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #2a2a2a;
    }

    .set-description {
        padding: 12px;
        margin-top: -2px;
        font-size: 16px;
        font-weight: 500;
    }

    .set-description p {
        margin: 0;
        color: #fff;
    }

    /* Адаптивність */
    @media (max-width: 768px) {
        .set-container {
            padding-left: 3%;
            padding-right: 3%;
        }

        .set-array {
            justify-content: center;
        }

        .block-set {
            width: 200px;
            height: 200px;
        }

        .background-preview {
            height: 140px;
        }
    }

    @media (max-width: 480px) {
        .block-set {
            width: 100%;
            max-width: 280px;
        }
    }
</style>
