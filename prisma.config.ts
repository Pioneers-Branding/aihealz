import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

// Load .env file
config();

export default defineConfig({
    schema: path.join(__dirname, 'prisma', 'schema.prisma'),
    datasource: {
        url: process.env.DATABASE_URL || 'postgresql://taps@localhost:5432/aihealz?schema=public',
    },
});
