import { ResultSet } from 'expo-sqlite'

import { IMusic } from '../../../types'
import { DatabaseService } from '../databaseService'
import { Table } from '../tableSchema'

export class MusicsTable extends Table {
  version = 1
  create = [
    'CREATE TABLE IF NOT EXISTS musics (',
    'id TEXT PRIMARY KEY NOT NULL UNIQUE,',
    'name TEXT NOT NULL,',
    'coverUrl TEXT NOT NULL,',
    'youtubeId TEXT NOT NULL,',
    'fileUri TEXT,',
    'artistId TEXT NOT NULL,',
    'FOREIGN KEY(artistId) REFERENCES artists(id) ON DELETE CASCADE ON UPDATE CASCADE);'
  ]
}
export interface IDatabaseMusic {
  id: string
  name: string
  coverUrl: string
  youtubeId: string
  fileUri: string | null
  artistId: string
}

export interface IDatabaseMusicLeftJoinArtists extends IDatabaseMusic {
  artistName: string
  artistCoverUrl: string
}

interface UseMusicTableReturn {
  get: (id: string) => Promise<IMusic | null>
  insert: (
    id: string,
    name: string,
    coverUrl: string,
    youtubeId: string,
    artistId: string
  ) => Promise<void>
  getByYoutubeId: (youtubeId: string) => Promise<IMusic | null>
  getByArtistId: (artistId: string) => Promise<IMusic[]>
  delete: (id: string) => Promise<void>
  list: () => Promise<IMusic[]>
}
export function sanitizeDatabaseMusicResult(
  databaseMusic: IDatabaseMusicLeftJoinArtists
): IMusic {
  return {
    id: databaseMusic.id,
    name: databaseMusic.name,
    coverUrl: databaseMusic.coverUrl,
    youtubeId: databaseMusic.youtubeId,
    fileUri: databaseMusic.fileUri,
    artist: {
      id: databaseMusic.artistId,
      name: databaseMusic.artistName,
      coverUrl: databaseMusic.artistCoverUrl
    }
  }
}
export function useMusicTable(database: DatabaseService): UseMusicTableReturn {
  return {
    async get(id: string): Promise<IMusic | null> {
      const sqlResult = await database.execSQLQuery({
        sql: [
          'SELECT musics.*,',
          'artists.name AS artistName,',
          'artists.coverUrl AS  artistCoverUrl',
          'FROM musics LEFT JOIN artists',
          'ON musics.artistId = artists.id',
          'WHERE musics.id = ?'
        ],
        args: [id]
      })
      if (sqlResult.error) {
        throw sqlResult.error
      } else if (sqlResult.result) {
        const { rows } = sqlResult.result as ResultSet
        const music = rows[0] as IDatabaseMusicLeftJoinArtists
        return music ? sanitizeDatabaseMusicResult(music) : null
      } else throw new Error('Erro Desconhecido')
    },
    async delete(id: string): Promise<void> {
      await database.execSQLQuery({
        sql: ['DELETE FROM musics', 'WHERE musics.id = ?'],
        args: [id]
      })
    },
    async getByYoutubeId(youtubeId: string): Promise<IMusic | null> {
      const sqlResult = await database.execSQLQuery({
        sql: [
          'SELECT musics.*,',
          'artists.name AS artistName,',
          'artists.coverUrl AS  artistCoverUrl',
          'FROM musics LEFT JOIN artists',
          'ON musics.artistId = artists.id',
          'WHERE musics.youtubeId = ?'
        ],
        args: [youtubeId]
      })
      if (sqlResult.error) {
        throw sqlResult.error
      } else if (sqlResult.result) {
        const { rows } = sqlResult.result as ResultSet
        const music = rows[0] as IDatabaseMusicLeftJoinArtists
        return music ? sanitizeDatabaseMusicResult(music) : null
      } else throw new Error('Erro Desconhecido')
    },
    async getByArtistId(artistId: string): Promise<IMusic[]> {
      const sqlResult = await database.execSQLQuery({
        sql: [
          'SELECT musics.*,',
          'artists.name AS artistName,',
          'artists.coverUrl AS  artistCoverUrl',
          'FROM musics LEFT JOIN artists',
          'ON musics.artistId = artists.id',
          'WHERE musics.artistId = ?'
        ],
        args: [artistId]
      })
      if (sqlResult.error) {
        throw sqlResult.error
      } else if (sqlResult.result) {
        const resultSet = sqlResult.result as ResultSet
        const rows = resultSet.rows as IDatabaseMusicLeftJoinArtists[]
        return rows.map(sanitizeDatabaseMusicResult)
      } else throw new Error('Erro Desconhecido')
    },
    async insert(
      id: string,
      name: string,
      coverUrl: string,
      youtubeId: string,
      artistId: string
    ): Promise<void> {
      await database.execSQLQuery({
        sql: [
          'INSERT INTO musics (id, name, coverUrl, youtubeId, artistId)',
          'VALUES (?,?,?,?,?)'
        ],
        args: [id, name, coverUrl, youtubeId, artistId]
      })
    },
    async list(): Promise<IMusic[]> {
      const sqlResult = await database.execSQLQuery({
        sql: [
          'SELECT musics.*,',
          'artists.name AS artistName,',
          'artists.coverUrl AS  artistCoverUrl',
          'FROM musics LEFT JOIN artists',
          'ON musics.artistId = artists.id'
        ],
        args: []
      })
      if (sqlResult.error) {
        throw sqlResult.error
      } else if (sqlResult.result) {
        const resultSet = sqlResult.result as ResultSet
        const rows = resultSet.rows as IDatabaseMusicLeftJoinArtists[]
        return rows.map(sanitizeDatabaseMusicResult)
      } else throw new Error('Erro Desconhecido')
    }
  }
}
