var express = require('express');
var app = express();
var server = require('http').createServer(app);

var stateQuiz = require('./stateQuiz');
var rp = require('request-promise');
require('dotenv').config();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// app.use(express.static('client'));
app.listen(process.env.PORT||4000);

const NAME_GAME = 'nameGame';
const TURNS_ARG = 'turns';

app.post('/guess', function(req,res){
    
    var intent = req.body.result.action;
    console.log(intent)
    var result = dialogflowResponse();

    if (intent === 'input.welcome') {
        result.speech = "Welcome to Trivia. What game would you like to play?"
    }

    else if (intent === 'startNameGame') {
        result.contextOut = [{"name":NAME_GAME, "lifespan":2, "parameters":{TURNS_ARG:5}}];
        result.speech = "Name 5 states in the United States";
    }

    else if (intent === 'guess') {
        var guess = req.body.result.parameters.guess;
        var answers = famousPeopleQuiz.questions[0].answers;
        var result = dialogflowResponse();
        var answer = isAnAnswer(guess,answers);
        result.speech = answer ? answer.key : "Not an answer";
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