const express = require("express");
const app = express();
const spotifyRouter = require("./routes/spotify");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/spotify", spotifyRouter);

let port = process.env.PORT || 3001;
console.log(
  `Listening on port ${port}. Go /login to initiate authentication flow.`
);

app.listen(port);
