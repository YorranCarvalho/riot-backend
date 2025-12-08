import dotenv from 'dotenv';

dotenv.config();

export const env = {
    RIOT_API_KEY: process.env.RIOT_API_KEY || '',
    DATABASE_URL: process.env.DATABASE_URL || '',
}