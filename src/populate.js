const Post = require('./post');
const mongoose = require('mongoose');
const fs = require('fs');

let savedPosts = null;

mongoose.Promise = global.Promise;
mongoose.connect(
  'mongodb://localhost/so-posts',
  { useMongoClient: true }
);

const readPosts = () => {
  // cache posts after reading them once
  if (!savedPosts) {
    const contents = fs.readFileSync('posts.json', 'utf8');
    savedPosts = JSON.parse(contents);
  }
  return savedPosts;
};

const populatePosts = () => {
  readPosts();
  const promises = savedPosts.map((p) => {
    return new Post(p).save();
  });
  return Promise.all(promises)
    .then((result) => {
      console.log('done', result);
      mongoose.disconnect();
      return result;
    })
    .catch((err) => {
      console.log('ERROR', err);
      throw new Error(err);
    });
};

populatePosts();
module.exports = { readPosts, populatePosts };
