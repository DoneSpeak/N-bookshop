
/* Capp
 * https://github.com/nick-thompson/capp
 *
 * Copyright (c) 2013 Nick Thompson
 * MIT License.
 */

var glob    = require('glob');
var async   = require('async');
var nano    = require('nano');
var ncp     = require('ncp');
var fs      = require('fs');
var path    = require('path');
var lookup  = require('./lib/types').lookup;

/**
 * Load a design document from the _design.js directive
 * within a specified directory.
 *
 * @param {string} directory
 * @param {function} callback (err, document)
 */

function loadDocument (directory, callback) {
  var docPath = path.resolve(directory, '_design.js')
  fs.stat(docPath, function (err, stat) {
    if (err) return callback.call(null, err);
    if (stat.isFile()) {
      var document = require(docPath);
      return callback.call(null, null, document);
    }
    return callback.call(null, new Error('No _design.js file found!'));
  });
}


/**
 * Recursively load attachments from a directory onto
 * a design document.
 *
 * @param {object} doc design document
 * @param {string} directory path to the attachments directory
 * @param {function} callback (err, document)
 */

function loadAttachments (doc, directory, callback) {
  doc._attachments = doc._attachments || {};
  glob('**/*', { cwd: directory }, function (err, files) {
    async.each(files, function (file, done) {
      if (file.indexOf('_') === 0) return done();
      fs.stat(path.join(directory, file), function (err, stat) {
        if (err) return done(err);
        if (stat.isFile()) {
          fs.readFile(path.join(directory, file), function (err, data) {
            if (err) return done(err);
            var ext = file.split('.').pop()
            doc._attachments[file] = {}
            doc._attachments[file]['content_type'] = lookup(ext);
            doc._attachments[file]['data'] = data.toString('base64');
            done();
          });
        } else {
          done();
        }
      });
    }, function (err) {
      callback.call(null, err, doc);
    });
  });
}

/**
 * Build a design document from the specified directory
 * and push it to a Couch at the specified uri.
 *
 * @param {string} directory
 * @param {string} uri
 * @param {function} callback (err, responseBody)
 */

function push (directory, uri, callback) {
  var db = nano(uri);
  loadDocument(directory, function (err, doc) {
    if (err) return callback.call(null, err);
    loadAttachments(doc, directory, function (err, doc) {
      if (err) return callback.call(null, err);
      db.get(doc._id, function (err, body) {
        if (err && err.reason !== "missing") return callback.call(null, err);
        if (body && body._rev) {
          doc._rev = body._rev;
        }
        db.insert(doc, doc._id, callback);
      });
    });
  });
}

/**
 * Initialize a boilerplate CouchApp in the specified directory.
 *
 * @param {string} directory
 * @param {function} callback (err)
 */

function init (directory, callback) {
  var source = path.join(__dirname, 'template');
  ncp(source, directory, callback);
}

module.exports = {
  loadDocument: loadDocument,
  loadAttachments: loadAttachments,
  push: push,
  init: init
};
