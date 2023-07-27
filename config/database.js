const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const mongoURI = "mongodb://127.0.0.1/oneBitCodeNote";
//! For nodejs (v17.x) and above, use mongodb url "127.0.0.1" instead "localhost"

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    // useCreateIndex: true //! Esta opção foi preteria em versões posteriores à 3.0
  })
  .then(() => console.log("Connection successfully stablish!"))
  .catch((error) => console.log(error));
