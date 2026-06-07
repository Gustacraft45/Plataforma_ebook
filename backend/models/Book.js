const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  id:                { type: String, required: true },
  title:             { type: String, required: true },
  storyText:         { type: String, required: true },
  challengeQuestion: { type: String, required: true },
  expectedAnswer:    { type: String, default: '' }, // gabarito do escritor para a IA
});

const BookSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  subject:       { type: String, required: true },
  characterName: { type: String, required: true },
  authorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nodes:         [NodeSchema],
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
