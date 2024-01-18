class AlbumsHandler {
  constructor(service, storageService, validator, validatorUploads) {
    this._service = service;
    this._validator = validator;
    this._storageSevice = storageService;
    this._validatorUploads = validatorUploads;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverHandler(request, h) {
    const { cover } = request.payload;
    this._validatorUploads.validateImageHeaders(cover.hapi.headers);
    const { id } = request.params;

    const filename = await this._storageSevice.writeFile(cover, cover.hapi);
    await this._service.addAlbumCoverById(id, filename);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikesByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyValidAlbum(id, credentialId);
    await this._service.verifyAlbumLikes(id, credentialId);
    await this._service.addAlbumLikesById(id, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil dilike',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;

    const { isCache, likes } = await this._service.getAlbumLikes(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: +likes,
      },
    });
    if (isCache) response.header('X-Data-Source', 'cache');
    return response;
  }

  async deleteAlbumLikesByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.deleteAlbumLikesById(id, credentialId);

    return {
      status: 'success',
      message: 'Batal unlike album',
    };
  }
}

module.exports = AlbumsHandler;
