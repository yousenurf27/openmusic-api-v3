const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: (require, h) => handler.postCollaborationHandler(require, h),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: (require) => handler.deleteCollaborationHandler(require),
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
