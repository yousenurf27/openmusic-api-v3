const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapModelPlaylists, mapModelSongs, mapModelActivitiesPlaylist } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT p.*, c.user_id, u.username FROM playlists AS p
      LEFT JOIN collaborations AS c ON c.playlist_id = p.id
      INNER JOIN users AS u ON u.id = p.owner
      WHERE owner = $1 OR c.user_id = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapModelPlaylists);
  }

  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongOnPlaylist({ playlistId, songId }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal ditambahkan ke dalam playlist. Id tidak ditemukan');
    }
  }

  async getPlaylistSongs(id) {
    const playlistQuery = {
      text: `SELECT p.*, u.username FROM playlists AS p
      INNER JOIN users AS u ON u.id = p.owner
      WHERE p.id = $1`,
      values: [id],
    };

    const playlistResult = await this._pool.query(playlistQuery);

    if (!playlistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = playlistResult.rows.map(mapModelPlaylists)[0];

    const songsQuery = {
      text: `SELECT s.*, ps.playlist_id FROM songs AS s
      INNER JOIN playlist_songs AS ps ON ps.song_id = s.id
      WHERE ps.playlist_id = $1`,
      values: [id],
    };

    const songsResult = await this._pool.query(songsQuery);

    return {
      ...playlist,
      songs: songsResult.rows.map(mapModelSongs),
    };
  }

  async deleteSongOnPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus dari playlist. Id tidak ditemukan');
    }
  }

  async addActivitiesPlaylist(playlistId, songId, userId, action) {
    const id = nanoid(16);
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Activities gagal ditambahkan');
    }
  }

  async getActivitiesPlaylist(playlistId, userId) {
    const query = {
      text: `SELECT * FROM playlist_song_activities AS psa
      INNER JOIN users AS u ON u.id = psa.user_id
      INNER JOIN songs AS s ON s.id = psa.song_id
      WHERE playlist_id = $1 AND u.id = $2`,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapModelActivitiesPlaylist);
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
