const mongoose = require('mongoose');
const movements = mongoose.Schema(
  {
    n_client: String,
    name: String,
    role: Number,
    month: Number,
    year: Number,
    deliveries: Number,
  },
  {
    versionKey: false,
  }
);
const Movements = mongoose.model('movements', movements);
module.exports = Movements;
