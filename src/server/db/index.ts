import { drizzle } from 'drizzle-orm/bun-sqlite'
import { Database } from 'bun:sqlite'
import { migrateDB } from './migrate'
import * as appSchema from './schema/app'
import * as authSchema from './schema/auth'
import { env } from '~/env'

const globalForDb = globalThis as unknown as {
  client?: Database
}

export const client = globalForDb.client ?? new Database(env.DATABASE_PATH)
if (env.NODE_ENV !== 'production') globalForDb.client = client

client.run('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')

migrateDB(client)

export const db = drizzle({ client, schema: { ...appSchema, ...authSchema } })
