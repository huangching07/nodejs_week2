const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, '貼文內容未填寫']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    required: [true, '貼文作者未填寫']
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Post = new mongoose.model('Post', postSchema);

module.exports = Post;