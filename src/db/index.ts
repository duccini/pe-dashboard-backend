import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as Database from 'better-sqlite3';

import * as schema from './schema';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });
