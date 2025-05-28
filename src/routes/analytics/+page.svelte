<script></script>

<div class="analyt-container">
    <h1>Your Analytics</h1>
    <div class="chat-list">
        <p>
            Here you can find all neccesary info about interaction with your
            clients
        </p>
    </div>
    <div class="analyt-data">
        <div class="block">
            <div class="img-bg-1">
                <h2>3.4</h2>
            </div>
            <div class="text-bm">
                <p>Average time to respond</p>
            </div>
        </div>
        <div class="block">
            <div class="img-bg-2">
                <h2>100%</h2>
            </div>
            <div class="text-bm">
                <p>Percentage of completed discussions</p>
            </div>
        </div>
    </div>
</div>

<style>
    .analyt-container {
        color: var(--color-fff);
        padding-top: 4.2%;
        padding-left: 5%;
        background-color: var(--color-070709);
        min-height: 100vh;
    }

    h1 {
        font-size: 30px;
        color: var(--color-fff);
        margin: 0;
    }

    .chat-list p {
        font-size: 14px;
        color: var(--color-9b9ca3);
        margin-top: 25px;
        font-weight: 500;
        margin-bottom: 0;
    }

    .analyt-data {
        margin-top: 54px;
        display: flex;
        gap: 66px;
    }

    .block {
        border-radius: 20px;
        width: 450px;
        height: 420px;
        background-color: var(--color-121213);
        transition: background-color 0.2s ease;
    }

    .img-bg-1 {
        width: 450px;
        height: 368px;
        background-image: url("../../lib/images/bg-an-1.png");
        background-size: cover;
        background-position: center;
        border-radius: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .img-bg-2 {
        width: 450px;
        height: 368px;
        background-image: url("../../lib/images/bg-an-2.png");
        background-size: cover;
        background-position: center;
        border-radius: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .text-bm {
        font-size: 18px;
        padding-left: 22px;
        padding-top: 12px;
        font-weight: 500;
        display: flex;
        align-items: center;
    }

    .text-bm p {
        color: var(--color-fff);
        margin: 0;
    }

    h2 {
        font-size: 36px;
        font-weight: 500;
        color: #fff;
        margin: 0;
    }

    

    /* Адаптивність для ноутбуків */
    @media (max-width: 1366px) {
        .analyt-container {
            padding-top: 3.5%;
            padding-left: 4%;
        }

        h1 {
            font-size: 26px;
        }

        .chat-list p {
            font-size: 13px;
            margin-top: 20px;
        }

        .analyt-data {
            margin-top: 45px;
            gap: 50px;
        }

        .block {
            width: 380px;
            height: 350px;
        }

        .img-bg-1,
        .img-bg-2 {
            width: 380px;
            height: 300px;
        }

        .text-bm {
            font-size: 16px;
            padding-left: 18px;
            padding-top: 10px;
        }

        h2 {
            font-size: 32px;
        }
    }

    @media (max-width: 1024px) {
        .analyt-container {
            padding-top: 3%;
            padding-left: 3%;
            padding-right: 3%;
        }

        h1 {
            font-size: 24px;
        }

        .chat-list p {
            font-size: 12px;
            margin-top: 18px;
        }

        .analyt-data {
            margin-top: 40px;
            gap: 30px;
        }

        .block {
            width: 320px;
            height: 300px;
        }

        .img-bg-1,
        .img-bg-2 {
            width: 320px;
            height: 250px;
        }

        .text-bm {
            font-size: 14px;
            padding-left: 16px;
            padding-top: 8px;
        }

        h2 {
            font-size: 28px;
        }
    }

    /* Адаптивність для планшетів */
    @media (max-width: 768px) {
        .analyt-container {
            padding: 20px;
        }

        h1 {
            font-size: 22px;
        }

        .chat-list p {
            font-size: 12px;
            margin-top: 15px;
        }

        .analyt-data {
            margin-top: 30px;
            flex-direction: column;
            gap: 20px;
            align-items: center;
        }

        .block {
            width: 100%;
            max-width: 350px;
            height: 280px;
        }

        .img-bg-1,
        .img-bg-2 {
            width: 100%;
            height: 230px;
        }

        .text-bm {
            font-size: 14px;
            padding-left: 16px;
            padding-top: 8px;
        }

        h2 {
            font-size: 26px;
        }
    }

    /* Адаптивність для мобільних */
    @media (max-width: 480px) {
        .analyt-container {
            padding: 15px;
        }

        h1 {
            font-size: 20px;
        }

        .chat-list p {
            font-size: 11px;
            margin-top: 12px;
        }

        .analyt-data {
            margin-top: 25px;
            gap: 15px;
        }

        .block {
            max-width: 100%;
            height: 250px;
            border-radius: 15px;
        }

        .img-bg-1,
        .img-bg-2 {
            height: 200px;
            border-radius: 15px;
        }

        .text-bm {
            font-size: 12px;
            padding-left: 12px;
            padding-top: 6px;
        }

        h2 {
            font-size: 22px;
        }
    }
</style>
