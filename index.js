const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
const PAGE_ACCESS_TOKEN = '3RmNNPsoiNoZB68NoEOYp2ZAwZDZD'; // هذا هو التوكن، لا تنشريه لاحقاً

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('بوت الخدمات الجزائرية شغال!');
});

app.post('/webhook', (req, res) => {
  let body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

function handleMessage(sender_psid, received_message) {
  let text = received_message.text?.toLowerCase();
  let response;

  if (text.includes("بطاقة") || text.includes("بيومترية")) {
    response = {
      text: "لخدمات البطاقة البيومترية، زور الموقع: https://passeport.interieur.gov.dz"
    };
  } else if (text.includes("منحة") || text.includes("بطالة")) {
    response = {
      text: "معلومات منحة البطالة: https://minha.anem.dz"
    };
  } else if (text.includes("الذهبية")) {
    response = {
      text: "لفتح حساب CCP وطلب البطاقة الذهبية: https://baridinet.poste.dz"
    };
  } else {
    response = {
      text: `مرحبا بيك يا مواطن جزائري! كتبت: "${received_message.text}". أكتب كلمة مثل "بطاقة"، "منحة"، "ذهبية" باش نعاونك.`
    };
  }

  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  let request_body = {
    recipient: { id: sender_psid },
    message: response
  };

  request({
    uri: 'https://graph.facebook.com/v13.0/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('الرد تبعث!');
    } else {
      console.error('فشل في إرسال الرسالة: ' + err);
    }
  });
}

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => console.log(`بوت الخدمات الجزائري شغال على البورت ${PORT}`));
