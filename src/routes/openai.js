const { Router, response } = require("express");
const router = Router();

const config = require('../config');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: config.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const responses = {};

router.post('/api/chatgpt', async (req, res) => {
    try {
        res.send("Esperando respuesta de chatgpt...")
        let userId = req.body.userId;
        let question = req.body.question;
        responses[userId] = { "completion": null, "state": 0 }
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: question,
            temperature: 0,
            max_tokens: 1500,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
        responses[userId] = { completion, "state": 1 };
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al consumir la API de OPENAI');
    }
});

router.get('/api/getResponse/:userId', async (req, res) => {
    try {
        let userId = req.params.userId;
        let estado = responses[userId];
        if (!userId || !responses[userId]) {
            res.send('Todavia no has realizado ninguna pregunta')
        } else if (estado.state != 1) {
            res.send('Trabajando en tu respuesta')
        }
        else {
            let response = responses[userId];
            res.send(response.completion.data.choices[0].text);
            //responses[userId] = null;
            delete responses[userId];
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al consumir la API de OPENAI');
    }

});

module.exports = router;