import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma', // Relative to the backend folder
  datasource: {
    url: env('DATABASE_URL'),
  },
});