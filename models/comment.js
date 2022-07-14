var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  author: { type: String, required: true },
  timestamp: { type: String, required: true },
  text: { type: String, required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true }
});

module.exports = mongoose.model('Comment', CommentSchema);