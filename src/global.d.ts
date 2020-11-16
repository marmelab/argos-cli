declare namespace NodeJS {
    interface ProcessEnv {
        NAME: string;
    }
}

declare module "js-yaml" {
    export function safeLoad<T = unknown>(value: string): T;
}
