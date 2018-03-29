var FCM = require('fcm-node');

let sendPushMessages = function (recipients, msg) {
  var serverKey = 'AAAAFr4VT6I:APA91bFeEx4prEV95KvForzMBRRzCOlwJAmJ3_MFa8YKH8pp0FncS5bdr6m8WeOy4v57ofNu_1Qtqx4YK8GBZXlaJ3fWb1U_9lsZpxQq1jgLJYtTC2iHZwkVO0G6HkD92lH61D57yidG'; //put your server key here
  var fcm = new FCM(serverKey);

  recipients.forEach((recipient) => {
    console.log(recipient)
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: recipient,

        notification: {
            title: msg.title,
            body: msg.body
        }
    };

    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
            console.log(err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
  })
}


module.exports = {
  sendPushMessages
}
