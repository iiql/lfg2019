var express = require('express')
var app = express()

var jwt = require('jsonwebtoken')

const port = 3000

var notifications = []

app.get('/v1/user/token/generate/client/', function (req, res) {
    var token = jwt.sign({user: req.query.userID}, 'client')
    res.send(token)
})

app.get('/v1/user/token/generate/transaction/', function (req, res) {
    var transactionToken = jwt.sign({user: req.query.userID}, 'transaction')
    //console.log(transactionToken)
    res.send(transactionToken)
})

app.get('/v1/user/token/generate/notifications/', function (req, res) {
    if (notifications[0] == undefined) {
        res.send('No notifications.')
    }
    else {
        res.send(notifications[0])
    }
})

app.get('/v1/user/token/consume/', function (req, res) {
    //TODO: Finish
    var decoded = jwt.verify(req.token, 'transaction', function(err, decoded) {
        console.log(decoded.user);
    })

    var query = req.query

    // notifications.push(x)
    res.send('/user/token/consume/')
})

app.listen(port)