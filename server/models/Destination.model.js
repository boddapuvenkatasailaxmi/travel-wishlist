const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  continent: { type: String },
  budget:    { type: Number, default: 0 },
  visited:   { type: Boolean, default: false },
  note:      { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);