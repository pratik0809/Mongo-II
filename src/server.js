const bodyParser = require('body-parser');
const express = require('express');
const Posts = require('./post');

const STATUS_USER_ERROR = 422;

const server = express();
// to enable parsing of json bodies for post requests
server.use(bodyParser.json());

server.get('/accepted-answer/:soID', (req, res) => {
  const { soID } = req.params;
  // Query #1:
  Posts.find({ soID })
    .then((data) => {
      // Check for an empty array which tells us no soID was found:
      if (data.length === 0) throw new Error('soID not found.');
      // Extract the acceptedAnswerID from the what our query returns:
      const acceptedAnswerID = data[0].acceptedAnswerID;
      // Query #2:
      Posts.find({ soID: acceptedAnswerID })
        .then((acceptedAnswer) => {
          // Check for an empty array which tells us no soID with acceptedAnswerID was found:
          if (acceptedAnswer.length === 0) throw new Error('No accepted answer for this question found.');
          // If we found the answer, send it to the client:
          res.json(acceptedAnswer);
        })
        .catch(({ message }) => {
          res.status(STATUS_USER_ERROR);
          res.json({ Error: message });
        });
    })
    .catch(({ message }) => {
      res.status(STATUS_USER_ERROR);
      res.json({ Error: message });
    });
});

server.get('/top-answer/:soID', (req, res) => {
  const { soID } = req.params;
  // Find the question specified in the params:
  Posts.find({ soID })
    .then(([question]) => {
      // Throw an error if the question wasn't found:
      if (!question) throw new Error('soID not found.');
      // Find the first answer to the question that is not the accepted answer:
      Posts.findOne({ $and: [{ soID: { $ne: question.acceptedAnswerID } }, { parentID: question.soID }] })
        // Sort Descending to pick highest scored:
        .sort({ score: -1 })
        .then((topanswer) => {
          if (!topanswer) throw new Error('No answer for this question found.');
          res.json(topanswer);
        })
        .catch(({ message }) => {
          res.status(STATUS_USER_ERROR);
          res.json({ Error: message });
        });
    })
    .catch(({ message }) => {
      res.status(STATUS_USER_ERROR);
      res.json({ Error: message });
    });
});

server.get('/popular-jquery-questions', (req, res) => {
  Posts.find({
    $and: [
         { tags: 'jquery' },
      { $or: [
             { score: { $gt: 5000 } },
             { 'user.reputation': { $gt: 200000 } }
      ]
      }
    ]
  })
  .exec()
  .then((topAnswers) => {
    if (!topAnswers) throw new Error('No top answers found.');
    res.json(topAnswers);
  })
  .catch(({ message }) => {
    res.status(STATUS_USER_ERROR);
    res.json({ Error: message });
  });
});

server.get('/npm-answers', (req, res) => {
  Posts.find({ tags: 'npm' }).exec()
  .then((npmQuestions) => {
    const npmQuestionIDs = npmQuestions.map(npmQuestion => npmQuestion.soID);
    Posts.find({ parentID: { $in: npmQuestionIDs } })
    .then((npmAnswers) => {
      res.json(npmAnswers);
    });
  })
  .catch(({ message }) => {
    res.status(STATUS_USER_ERROR);
    res.json({ Error: message });
  });
});
module.exports = { server };
