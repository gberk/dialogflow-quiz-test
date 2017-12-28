var express = require('express');
var app = express();
var server = require('http').createServer(app);

var statesQuiz = require('./statesQuiz')
var rp = require('request-promise');
require('dotenv').config();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// app.use(express.static('client'));
app.listen(4000);
app.post('/guess', function(req,res){
    var guess = req.result.parameters.guess;
    var answers = statesQuiz.questions[0].answers;
    var result = isAnAnswer(guess,answers) || "Not an answer";
    res.send(result)
})

var isAnAnswer = function(guess,answers){
    var answer = null;
    guess = guess.toLowerCase();
    answers.some(function(ans){
        if(ans.key.toLowerCase === guess){ //Should also iterate over phrasings
            answer = ans;
            return true;
        }
        if(ans.phrasings.some(function(phr){
            if(phr.toLowerCase() === guess){
                answer = ans;
            }
        }));
    });
    return answer;
}