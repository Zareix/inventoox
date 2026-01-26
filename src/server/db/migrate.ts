import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import type { Database } from 'bun:sqlite'

export const migrateDB = (client: Database) => {
  console.log('Migrating database...')

  const db = drizzle({ client })

  migrate(db, { migrationsFolder: './drizzle' })

  console.log('Database migrated')
}
