const { Router, response } = require("express");
const router = Router();

const config = require('../config');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: config.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const responses = {};

const openAIRequest = async (userId, question) => {
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: question,
            temperature: 0,
            max_tokens: 1500,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
        responses[userId] = { completion, state: 1 };
    } catch (error) {
        throw error;
    }
}

router.post('/api/chatgpt', async (req, res) => {
    try {
        let userId = req.body.userId;
        let question = req.body.question;
        responses[userId] = { completion: null, state: 0 };
        let message = { message: 'Esperando' }
        res.json(message);
        await openAIRequest(userId, question);
    } catch (error) {
        console.error(error.response.data);
        let userId = req.body.userId;
        responses[userId] = { completion: 'Error al consumir la API de OPENAI', state: 2, error: error.response.data.error.message};
    }
});

// router.post('/api/chatgpt', async (req, res) => {
//     try {
//         let message = { message: 'Esperando' }
//         //res.json(message);
//         //res.send("Esperando respuesta de chatgpt...")
//         let userId = req.body.userId;
//         let question = req.body.question;
//         responses[userId] = { completion: null, state: 0 }
//         const completion = await openai.createCompletion({
//             model: "text-davinci-003",
//             prompt: question,
//             temperature: 0,
//             max_tokens: 1500,
//             top_p: 1,
//             frequency_penalty: 0.0,
//             presence_penalty: 0.0,
//         });
//         responses[userId] = { completion, state: 1 };
//     } catch (error) {
//         console.error(error.response.data);
//         responses[userId] = { completion: null, state: 2 }
//         let message = {
//             message: 'Error al consumir la API de OPENAI',
//             error: error.response.data.error.message
//         }
//         res.status(error.response.status).json(message);
//         //res.status(500).send('Error al consumir la API de OPENAI');
//     }
// });

router.get('/api/getResponse/:userId', async (req, res) => {
    try {
        let userId = req.params.userId;
        let estado = responses[userId];
        let message = { userId: userId, estado: estado, message: null }

        if (!message.userId || !message.estado) {
            message = { userId, estado, message: 'Todavia no has realizado ninguna pregunta' }
            res.json(message);
            //res.send('Todavia no has realizado ninguna pregunta')
        } else if (message.estado.state == 0) {
            message = { userId, estado: estado.state, message: 'Espera' }
            res.json(message);
            //res.send('Trabajando en tu respuesta')
        }
        else if (message.estado.state == 1){
            //let response = responses[userId];
            message = { userId, estado: estado.state, message: estado.completion.data.choices[0].text }
            res.json(message);
            //res.send(response.completion.data.choices[0].text);
            //responses[userId] = null;
            delete responses[userId];
        }
        else if (message.estado.state == 2){
            //let response = responses[userId];
            message = { userId, estado: estado.state, message: estado.completion, error: estado.error }
            res.json(message);
            //res.send(response.completion.data.choices[0].text);
            //responses[userId] = null;
            delete responses[userId];
        }
    } catch (error) {
        console.error(error);
        let message = { message: 'Error al consumir la API de OPENAI' }
        res.status(500).json(message);
        //res.status(500).send('Error al consumir la API de OPENAI');
    }

});

module.exports = router;
