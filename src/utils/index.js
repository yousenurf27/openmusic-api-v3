const mapModelAlbums = ({
  id,
  name,
  year,
  cover,
}) => ({
  id,
  name,
  year: +year,
  coverUrl: cover,
});

const mapModelSongs = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const mapModelSong = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({
  id,
  title,
  year: parseInt(year),
  genre,
  performer,
  duration: parseInt(duration),
  albumId,
});

const mapModelPlaylists = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username,
});

const mapModelActivitiesPlaylist = ({
  username,
  title,
  action,
  time,
}) => ({
  username,
  title,
  action,
  time,
});

module.exports = {
  mapModelAlbums, mapModelSongs, mapModelSong, mapModelPlaylists, mapModelActivitiesPlaylist,
};
