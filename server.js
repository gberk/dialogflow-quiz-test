var express = require('express');
var app = express();
var server = require('http').createServer(app);

var statesQuiz = require('./statesQuiz');
var famousPeopleQuiz = require('./famousPeopleQuiz');

var rp = require('request-promise');
require('dotenv').config();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// app.use(express.static('client'));
app.listen(process.env.PORT||4000);

const GAME = 'game';
const TURNS_ARG = 'turns';

var currentGame;

app.post('/guess', function(req,res){
    
    var intent = req.body.result.action;
    var result = dialogflowResponse();

    if (intent === 'input.welcome') {
        result.speech = "Welcome to Trivia. What game would you like to play?"
    }

    else if (intent === 'startGame') {
        var game = req.body.result.parameters.game;
        result.contextOut = [{"name":GAME, "lifespan":2, "parameters":{TURNS_ARG:5}}];
        result.speech = statesQuiz.questions[0].text;
        if (game === 'name') {
            currentGame = 'nameGame';
        } else {
            currentGame = 'famousGame';
        }
    }

    else if (intent === 'guess') {
        console.log(req.body);
        if (currentGame === 'nameGame') {
            var guess = req.body.result.parameters.guess;
            var answers = statesQuiz.questions[0].answers;
            var result = dialogflowResponse();
            var answer = isAnAnswer(guess,answers);
            result.speech = answer ? answer.key : "Not an answer";
        } else {
            var guess = req.body.result.parameters.guess;
            var answers = famousPeopleQuiz.questions[0].answers;
            var result = dialogflowResponse();
            var answer = isAnAnswer(guess,answers);
            result.speech = answer ? answer.key : "Not an answer";
        }
    }
    else {
        result.speech = "We had a problem doing a flip."
    }

    res.send(result)
})

var dialogflowResponse = function(){
    return {
        speech: "",
        displayText: "",
        data: {},
        contextOut: [],
        source: "",
        followupEvent: {}
    }
}

var isAnAnswer = function(guess,answers){
    var answer = null;
    guess = guess.toLowerCase();
    answers.some(function(ans){
        if(ans.key.toLowerCase() === guess){
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