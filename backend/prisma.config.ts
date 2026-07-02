declare const process: any; // Tells TypeScript to skip type checks for the global process object

import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './backend/prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});