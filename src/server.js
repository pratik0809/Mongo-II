const bodyParser = require('body-parser');
const express = require('express');
const Post = require('./post');

const STATUS_USER_ERROR = 422;
const port = process.env.PORT || 3000;
const server = express();
// to enable parsing of json bodies for post requests
server.use(bodyParser.json());

server.get('/accepted-answer/:soID', (req, res) => {
  const { soID } = req.params;
  Post.find({ soID }, (err, data) => {
    if (err) {
      return res.json({ err });
    }
    return res.json({ data });
  });
});

server.listen(port);
module.exports = { server };
