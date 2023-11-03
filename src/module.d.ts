declare namespace NodeJS{
    export interface ProcessEnv {
        DATABASE_URL: string;
        PORT: number;
        JWT_SECRET: string;
        JWT_REFRESH: string;
    }
}