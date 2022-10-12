const mongoose = require('mongoose');
const workers = mongoose.Schema({
  n_client: String,
  name: String,
  role: Number
});
const Worker = mongoose.model('worker', workers);
module.exports = Worker;
