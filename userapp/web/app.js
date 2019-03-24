function setup() {
    var clientToken = "";
    const requestClientID = new XMLHttpRequest();
    const reqClientURL = 'http://localhost:3000/v1/user/token/generate/client/';

    requestClientID.onreadystatechange=function() {
        if (this.readyState == 4 && this.status == 200) {
            clientToken = requestClientID.responseText;
        }
    }

    requestClientID.open("GET", reqClientURL, true);
    requestClientID.send();

    var transactionToken = "";
    const requestTransactionID = new XMLHttpRequest();
    const reqTransactionURL = 'http://localhost:3000/v1/user/token/generate/transaction/';

    requestTransactionID.onreadystatechange=function() {
        if (this.readyState == 4 && this.status == 200) {
            transactionToken = requestTransactionID.response;

            if(transactionToken != null) {
                document.getElementById("token").innerHTML = transactionToken;
            }

            generateQRCode(transactionToken);
        }
    }

    requestTransactionID.open("GET", reqTransactionURL, true);
    requestTransactionID.send();
}

function generateQRCode(transactionToken) {
    QRCode.toCanvas(document.getElementById('canvas'), transactionToken, {
        width: 340,
        height: 340
    }, function (error) {
        if (error) console.error(error)
            console.log('success!');
    });
}