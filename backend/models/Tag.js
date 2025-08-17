const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 20
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// 创建索引
tagSchema.index({ name: 1 })

module.exports = mongoose.model('Tag', tagSchema)
