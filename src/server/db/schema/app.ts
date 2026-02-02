import { relations, sql } from 'drizzle-orm'
import { index, sqliteTable } from 'drizzle-orm/sqlite-core'
import { user } from './auth'

export const categories = sqliteTable(
  'category',
  (d) => ({
    id: d.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: d.text('name', { length: 256 }).notNull(),
    icon: d.text('icon', { length: 256 }).notNull(),
    parentCategoryId: d.integer('parent_category_id', { mode: 'number' }),
    createdAt: d
      .integer({ mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull(),
    updated_at: d
      .integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$onUpdateFn(() => new Date()),
  }),
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
  (d) => ({
    id: d.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: d.text('name', { length: 256 }).notNull(),
    icon: d.text('icon', { length: 256 }).notNull(),
    createdAt: d
      .integer({ mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull(),
    updated_at: d
      .integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$onUpdateFn(() => new Date()),
  }),
  (table) => [index('room_name_idx').on(table.name)],
)

export const roomsRelations = relations(rooms, ({ many }) => ({
  locations: many(locations),
}))

export type Room = typeof rooms.$inferSelect

export const locations = sqliteTable(
  'location',
  (d) => ({
    id: d.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    roomId: d
      .integer('room_id', { mode: 'number' })
      .notNull()
      .references(() => rooms.id),
    name: d.text('name', { length: 256 }).notNull(),
    icon: d.text('icon', { length: 256 }).notNull(),
    createdAt: d
      .integer({ mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull(),
    updated_at: d
      .integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$onUpdateFn(() => new Date()),
  }),
  (table) => [index('location_name_idx').on(table.name)],
)

export const locationsRelations = relations(locations, ({ one }) => ({
  room: one(rooms, {
    fields: [locations.roomId],
    references: [rooms.id],
  }),
}))

export type Location = typeof locations.$inferSelect

export const items = sqliteTable(
  'item',
  (d) => ({
    id: d.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: d.text('name', { length: 256 }).notNull(),
    categoryId: d
      .integer('category_id', { mode: 'number' })
      .notNull()
      .references(() => categories.id),
    locationId: d
      .integer('location_id', { mode: 'number' })
      .notNull()
      .references(() => locations.id),
    value: d.integer('value', { mode: 'number' }).notNull(),
    size: d.text('size', { length: 128 }).notNull(),
    owner_id: d.text('owner_id').references(() => user.id),
    quantity: d.integer('quantity', { mode: 'number' }).notNull(),
    brand: d.text('brand', { length: 256 }).notNull(),
    state: d
      .text('state', {
        length: 128,
        enum: ['stored', 'in use'],
      })
      .notNull(),
    createdAt: d
      .integer({ mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull(),
    updated_at: d
      .integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$onUpdateFn(() => new Date()),
  }),
  (table) => [index('item_name_idx').on(table.name)],
)

export const itemsRelations = relations(items, ({ one }) => ({
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
  location: one(locations, {
    fields: [items.locationId],
    references: [locations.id],
  }),
  owner: one(user, {
    fields: [items.owner_id],
    references: [user.id],
  }),
}))

export type Item = typeof items.$inferSelect
