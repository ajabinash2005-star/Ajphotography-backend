const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://ajabinash2005_db_user:NZdm1HkugZuv8SgD@cluster0.ygzf1cq.mongodb.net/test?retryWrites=true&w=majority"
)
.then(() => {
  console.log("Connected");
  process.exit(0);
})
.catch(err => {
  console.error(err);
});