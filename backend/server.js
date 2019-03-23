var express = require('express')
var app = express()
const port = 3000

app.get('/', function (req, res) {
    res.send('hello world')
})

app.get('/user/token/generate/client/', function (req, res) {
    //TODO: Finish
    res.send('/user/token/generate/client/')
})

app.get('/user/token/generate/transaction/', function (req, res) {
    //TODO: Finish
    res.send('/user/token/generate/transaction/')
})

app.get('/user/token/revoke/client/', function (req, res) {
    //TODO: Finish
    res.send('/user/token/revoke/client/')
})

app.get('/user/token/consume/', function (req, res) {
    //TODO: Finish
    res.send('/user/token/consume/')
})

app.listen(port)