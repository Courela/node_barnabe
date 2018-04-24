// index.js
const express        = require('express');
const bodyParser     = require('body-parser');

const app = express();

const port = 8000;

function routes(app, db) {
    app.post('/api/team', (req, res) => {
        // You'll create your note here.
        res.send('Hello')
    });
}

routes(app, null);
app.use(express.static('public'));

app.listen(port, () => {
  console.log('We are live on ' + port);
});