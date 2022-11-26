const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://34.224.200.231:27017/googlebooks', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

module.exports = mongoose.connection;
