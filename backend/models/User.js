const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  date: { type: String, required: true },       // 'YYYY-MM-DD'
  minutesRead: { type: Number, default: 0 },    // tempo lendo
  minutesIdle: { type: Number, default: 0 },    // tempo ocioso
});

const AnswerLogSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  nodeId: { type: String },
  status: { type: String, enum: ['correto', 'parcial', 'errado'] },
  answeredAt: { type: Date, default: Date.now },
});

const ProgressSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  currentNode: { type: String },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
});

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['leitor', 'escritor'], default: 'leitor' },
  xp:       { type: Number, default: 0 },
  progress:   [ProgressSchema],
  answerLog:  [AnswerLogSchema],   // histórico de respostas para analytics
  sessions:   [SessionSchema],     // histórico de sessões para tempo/ociosidade
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
