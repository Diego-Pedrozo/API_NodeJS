const express = require('express');
const app = express();

//middlewares
app.use(express.json());

//routes
app.use(require('./routes/openai'));

app.get('/', (req, res) => {
    res.send('API AlexaSkill')
})

const port = process.env.port || 8080;
app.listen(port, () => console.log(`http://localhost:8080/`));