function setup() {
    userID = prompt("Please enter a user id", "")
    var params = 'userID=' + userID.toString()

    var clientToken = "";
    const requestClientID = new XMLHttpRequest();
    const reqClientURL = 'http://localhost:3000/v1/user/token/generate/client/';

    requestClientID.onreadystatechange=function() {
        if (this.readyState == 4 && this.status == 200) {
            clientToken = requestClientID.responseText;
        }
    }

    requestClientID.open("GET", reqClientURL+'?'+params, true);
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

    var check = true;

    /*
    while (check) {
        const requestNotification = new XMLHttpRequest();
        const reqTransactionURL = 'http://localhost:3000/v1/user/token/generate/notifications/';
    
        requestNotification.onreadystatechange=function() {
            if (this.readyState == 4 && this.status == 200) {
                resp = requestNotification.response;
    
                if(resp != 'No notifications.') {
                    check = false;
                    if (confirm(resp)) {
                        // Send confirmation to server
                    }
                    else {
                        // Send denial to server
                    }
                }
            }
        }
    
        requestTransactionID.open("GET", reqTransactionURL, true);
        requestTransactionID.send();

        await sleep(3000);
    }*/
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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