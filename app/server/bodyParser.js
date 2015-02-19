var path = require("path");
var prettyBytes = require("pretty-bytes");
var format = require("util").format;
var config = require("config");

module.exports = function* bodyParser(next) {
  switch (this.request.is('json', 'urlencoded', 'multipart')) {
    case 'json':
      this.request.body = yield* this.request.json();
      break;
    case 'urlencoded':
      this.request.body = yield* this.request.urlencoded();
      break;
    case 'multipart':
      var fileSizeLimit = config.get("uploads.maxFileSize");
      var parts = this.request.parts({limits: {fileSize: fileSizeLimit}});
      this.request.body = {
        fields: {},
        files: {}
      };
      var part;
      while (part = yield parts) {
        if (part.length) {
          var key = part[0];
          var value = part[1];
          this.request.body.fields[key] = value;
        } else {
          var destination = path.join(config.get("uploads.path"), part.filename);
          yield this.save(part, destination);
          if (part.truncated) {
            var errorMsg = format("File too big. Max size is %s", prettyBytes(fileSizeLimit));
            var error = new Error(errorMsg);
            error.code = "file_too_big";
            throw error;
          }
          this.request.body.files[part.fieldname] = {
            path: destination,
            type: part.mimeType
          }
        }
      }
      break;
    default:
      this.throw(415, 'i do not know what to do with this request type')
  }
  yield next;
}