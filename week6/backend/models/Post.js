const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caption: { type: String },
    imageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    type:{type:String}
  },{ timestamps: true });
  

  module.exports = mongoose.model('Post', postSchema);