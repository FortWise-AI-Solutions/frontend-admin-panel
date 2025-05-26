export interface User {
    id: string;
    nickname: string;
    status: "on-going" | "offline" | "human-required" | "no-info";
    platform: "WhatsApp" | "Telegram" | "Instagram";
    [key: string]: any;
}
