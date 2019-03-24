var express = require('express')
var app = express()

var jwt = require('jsonwebtoken')

const port = 3000

app.get('/v1/user/token/generate/client/', function (req, res) {
    var token = jwt.sign({user: req.userID}, 'client')
    console.log(token)
    res.send(token)
})

app.get('/v1/user/token/generate/transaction/', function (req, res) {
    var transactionToken = jwt.sign({user: req.userID}, 'transaction')
    console.log(transactionToken)
    res.send(transactionToken)
})

app.get('/v1/user/token/consume/', function (req, res) {
    //TODO: Finish
    var decoded = jwt.verify(req.token, 'transaction', function(err, decoded) {
        console.log(decoded.user);
    })

    var query = req.query

    res.send('/user/token/consume/')
})

app.listen(port)