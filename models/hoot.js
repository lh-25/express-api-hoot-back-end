const mongoose = require('mongoose')
const User = require('./user.js')

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
)

const hootSchema = new mongoose.Schema(
  {
    title: { type: String, require: true },
    text: { type: String, require: true },
    category: { type: String, require: true, enum: ['News', 'Sports', 'Games', 'Movies', 'Music', 'Television'] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [commentSchema]
  },
  { timestamps: true }
)

const Hoot = mongoose.model('Hoot', hootSchema)
module.exports = Hoot