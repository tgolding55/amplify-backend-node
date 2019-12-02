const express = require("express");
const app = express();
const spotifyRouter = require("./routes/spotify");
app.use("/spotify", spotifyRouter);


let port = process.env.PORT || 3001;
console.log(
  `Listening on port ${port}. Go /login to initiate authentication flow.`
);

app.listen(port);
