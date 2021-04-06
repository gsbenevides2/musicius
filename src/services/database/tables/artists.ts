import { ResultSet } from 'expo-sqlite'

import { DatabaseService } from '../databaseService'
import { Table } from '../tableSchema'

export class ArtistsTable extends Table {
  version = 1
  create = [
    'CREATE TABLE IF NOT EXISTS artists (',
    'id TEXT PRIMARY KEY NOT NULL UNIQUE,',
    'name TEXT NOT NULL,',
    'coverUrl TEXT NOT NULL)'
  ]
}
interface IDatabaseArtist {
  id: string
  name: string
  coverUrl: string
}
export interface UseArtistsTable {
  getArtist(id: string): Promise<IDatabaseArtist | null>
  insert(id: string, name: string, coverUrl: string): Promise<void>
  list(): Promise<IDatabaseArtist[]>
  delete(artistId: string): Promise<void>
}
export function useArtistTable(database: DatabaseService): UseArtistsTable {
  return {
    async getArtist(id: string): Promise<IDatabaseArtist | null> {
      const sqlResult = await database.execSQLQuery({
        sql: ['SELECT * FROM artists', 'WHERE id = ?'],
        args: [id]
      })
      if (sqlResult.error) {
        throw sqlResult.error
      } else if (sqlResult.result) {
        const { rows } = sqlResult.result as ResultSet
        const artist = rows[0] as IDatabaseArtist
        return artist || null
      } else return null
    },
    async insert(id: string, name: string, coverUrl: string): Promise<void> {
      await database.execSQLQuery({
        sql: ['INSERT INTO artists (id, name, coverUrl)', 'VALUES (?,?,?)'],
        args: [id, name, coverUrl]
      })
    },
    async list(): Promise<IDatabaseArtist[]> {
      const sqlResult = await database.execSQLQuery({
        sql: ['SELECT * FROM artists'],
        args: []
      })
      if (sqlResult.error) {
        throw sqlResult.error
      } else if (sqlResult.result) {
        const { rows } = sqlResult.result as ResultSet
        const artists = rows as IDatabaseArtist[]
        return artists
      } else return []
    },
    async delete(artistId: string) {
      await database.execSQLQuery({
        sql: ['DELETE FROM artists WHERE id = ?'],
        args: [artistId]
      })
    }
  }
}
