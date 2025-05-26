<script>
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { goto } from "$app/navigation";

    let email = "";
    let password = "";
    let isLoading = false;
    let errorMessage = "";
    let showModal = true;
    let showWelcome = false;

    $: isFormValid = email.trim() !== "" && password.trim() !== "";

    async function handleSubmit() {
        if (!isFormValid) return;
        errorMessage = "";
        isLoading = true;

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            localStorage.setItem("user", JSON.stringify({ email }));
            showWelcome = true;

            setTimeout(() => {
                showModal = false;
            }, 500);

            setTimeout(() => {
                showWelcome = false;
                setTimeout(() => {
                    goto("/chats");
                }, 600);
            }, 5000);

        } catch (error) {
            errorMessage = "Authentication failed. Please check your credentials.";
            console.error("Login error:", error);
            isLoading = false;
        }
    }

    import imgLogin from "../../lib/images/img-login.png";
</script>

{#if showModal}
    <div class="modal-backdrop" transition:fade={{ duration: 500 }}>
        <div class="modal-content">
            <form on:submit|preventDefault={handleSubmit} class="login-form">
                {#if errorMessage}
                    <div class="error-message">{errorMessage}</div>
                {/if}
                <img src={imgLogin} alt="Login image" />
                <div class="form-group">
                    <label for="email">Company Name</label>
                    <input
                        type="email"
                        id="email"
                        bind:value={email}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        bind:value={password}
                        required
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !isFormValid}
                    class:valid-form={isFormValid}
                >
                    {isLoading ? "Logging in..." : "Log in"}
                </button>
            </form>
        </div>
    </div>
{/if}

{#if showWelcome}
    <div class="welcome-container" transition:fade={{ duration: 700 }}>
        <div class="welcome-text-wrapper">
            <h1 class="welcome-text">Welcome to Alara</h1>
        </div>
    </div>
{/if}

<style>
    .form-group {
        display: flex;
        flex-direction: column;
        margin-top: 30px;
    }

    form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: #fff;
    }

    input {
        height: 76px;
        font-size: 22px;
        padding-left: 18px;
        padding-right: 18px;
        border-radius: 6px;
        background-color: #0f0f0f;
        border: none;
        margin-top: 12px;
        color: #fff;
    }

    label {
        font-size: 16px;
        font-weight: 500;
    }

    img {
        width: 100%;
        height: 100%;
        max-width: 240px;
        max-height: 240px;
        margin: 0 auto;
    }

    button {
        margin-top: 30px;
        max-height: 76px;
        background-color: #530549;
        color: #fff;
        font-size: 24px;
        padding: 24px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    button:hover:not(:disabled) {
        background-color: #6b055f;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    button.valid-form {
        background-color: #aa0795;
    }

    button.valid-form:hover:not(:disabled) {
        background-color: #c208ab;
        box-shadow: 0 4px 12px rgba(170, 7, 149, 0.4);
    }

    button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #070709;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: #121213;
        padding: 2rem;
        border-radius: 8px;
        width: 90%;
        max-width: 400px;
        position: relative;
    }

    .error-message {
        background-color: rgba(255, 0, 0, 0.1);
        color: #ff6b6b;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 15px;
        text-align: center;
    }

    .welcome-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        background: #070709;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1001;
    }

    .welcome-text-wrapper {
        position: relative;
        overflow: hidden;
    }

    .welcome-text {
        font-size: 30px;
        height: 100px;
        letter-spacing: 2px;
        display: flex;
        align-items: center;
        font-weight: 700;
        background: linear-gradient(120deg, #ffffff 0%, #ffffff 100%);
        background-size: 200% auto;
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        animation:
            appear 1.8s ease-in-out forwards,
            disappear 2s ease-in-out 3.5s forwards;
        white-space: nowrap;
        transition: transform 0.4s ease, opacity 0.4s ease;
    }

    @keyframes appear {
        0% {
            opacity: 0;
            transform: translateY(40px) scale(0.98);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes disappear {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-40px) scale(0.98);
        }
    }
</style>
