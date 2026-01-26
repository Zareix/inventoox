import { relations } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable(
  'category',
  {
    id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name', { length: 256 }).notNull(),
    icon: text('icon', { length: 256 }).notNull(),
    parentCategoryId: int('parent_category_id', { mode: 'number' }),
  },
  (table) => [index('category_name_idx').on(table.name)],
)

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentCategoryId],
    references: [categories.id],
    relationName: 'subcategories',
  }),
  subcategories: many(categories, {
    relationName: 'subcategories',
  }),
}))

export type Category = typeof categories.$inferSelect

export const rooms = sqliteTable(
  'room',
  {
    id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name', { length: 256 }).notNull(),
    icon: text('icon', { length: 256 }).notNull(),
  },
  (table) => [index('room_name_idx').on(table.name)],
)

export const roomsRelations = relations(rooms, ({ many }) => ({
  locations: many(locations),
}))

export type Room = typeof rooms.$inferSelect

export const locations = sqliteTable(
  'location',
  {
    id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    roomId: int('room_id', { mode: 'number' })
      .notNull()
      .references(() => rooms.id),
    name: text('name', { length: 256 }).notNull(),
    icon: text('icon', { length: 256 }).notNull(),
  },
  (table) => [index('location_name_idx').on(table.name)],
)

export const locationsRelations = relations(locations, ({ one }) => ({
  room: one(rooms, {
    fields: [locations.roomId],
    references: [rooms.id],
  }),
}))

export type Location = typeof locations.$inferSelect
