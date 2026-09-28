const https = require('https');
https.get('https://bible-api.com/Psalm+119:73-82?translation=kjv', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => { console.log(JSON.parse(data).text); });
});
