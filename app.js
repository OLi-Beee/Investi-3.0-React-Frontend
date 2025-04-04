const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser')
const app = express();
const routes = require("./api/index");

app.use(cors());
app.use(routes);
app.use(bodyParser.json())
app.use(express.json());

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});
