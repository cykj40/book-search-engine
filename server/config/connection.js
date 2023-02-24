const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://cyrusk81:E23fatGwBu7xsfcw@googlebooks.1qd2mlp.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});


module.exports = mongoose.connection;
