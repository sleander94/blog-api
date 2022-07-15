var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema({
  author: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  isPublic: { type: Boolean, required: true },
});

module.exports = mongoose.model('Post', PostSchema);
