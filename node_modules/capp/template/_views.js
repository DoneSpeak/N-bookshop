module.exports = {
  meta: {
    map: (function (doc) {
      if (doc.musicbrainz_trackid) {
        emit(doc._id, doc);
      }
    }).toString()
  }
};
