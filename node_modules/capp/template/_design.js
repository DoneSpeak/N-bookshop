module.exports = {
  _id: '_design/app',
  rewrites: require('./_rewrites'),
  views: require('./_views'),
  filters: {
    data: (function (doc, req) {
      return !(doc._id[0] === '_');
    }).toString()
  }
};
