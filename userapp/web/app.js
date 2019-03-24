var http = require("http");

const requestClientID = new XMLHttpRequest();
const reqURL = 'http://localhost:3000/user/token/generate/client/';
requestClientID.open("GET", reqURL);
requestClientID.send();

requestClientID.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
        var clientToken = requestClientID.responseText;
    }
}

const requestTransactionID = new XMLHttpRequest();
const reqURL = 'http://localhost:3000/user/token/generate/transaction/';
requestTransactionID.open("GET", reqURL);
requestTransactionID.send();

requestTransactionID.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
        var transactionToken = requestTransactionID.responseText;
    }
}

if(transactionToken != null) {
    document.getElementById("token").innerHTML = token;
}

QRCode.toCanvas(document.getElementById('canvas'), transactionToken, {
    width: 340,
    height: 340
}, function (error) {
    if (error) console.error(error)
        console.log('success!');
});