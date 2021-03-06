import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import * as Permisions from 'expo-permissions'
import * as SQLite from 'expo-sqlite'

import { ArtistsTable } from './tables/artists'
import { MusicsTable } from './tables/music'
import { PlaylistsTable, PlaylistsMusicsTable } from './tables/playlists'
import {
  DatabaseServiceImplementation,
  ExecSQLQueryReturn,
  ExecSQLQueriesReturn,
  Query
} from './types'

export class DatabaseService implements DatabaseServiceImplementation {
  _db = SQLite.openDatabase('data.db')

  _parseQuery(query: Query): SQLite.Query {
    return {
      args: query.args,
      sql: query.sql.join(' ')
    }
  }

  async _copyForDev(): Promise<void> {
    if (__DEV__) {
      await Permisions.askAsync(Permisions.CAMERA_ROLL)
      const fileUri = `${FileSystem.documentDirectory}SQLite/data.db`
      const asset = await MediaLibrary.createAssetAsync(fileUri)
      await MediaLibrary.createAlbumAsync('Download', asset, false)
    }
  }

  async execSQLQuery(query: Query): Promise<ExecSQLQueryReturn> {
    const result = await this.execSQLQueries([query])
    return {
      error: result.error,
      result: result.result ? result.result[0] : undefined
    }
  }

  execSQLQueries(queries: Query[]): Promise<ExecSQLQueriesReturn> {
    return new Promise(resolve => {
      this._db.exec(
        queries.map(this._parseQuery),
        false,
        async (error, result) => {
          await this._copyForDev()
          resolve({
            error,
            result
          })
        }
      )
    })
  }

  async enableForeignKeys(): Promise<void> {
    await this.execSQLQuery({
      sql: ['PRAGMA foreign_keys = ON;'],
      args: []
    })
  }

  async createTables(): Promise<void> {
    const artists = new ArtistsTable()
    const musics = new MusicsTable()
    const playlists = new PlaylistsTable()
    const playlistsMusics = new PlaylistsMusicsTable()
    await this.execSQLQuery(artists.createTable())
    await this.execSQLQuery(musics.createTable())
    await this.execSQLQuery(playlists.createTable())
    await this.execSQLQuery(playlistsMusics.createTable())
  }
}
