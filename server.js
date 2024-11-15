const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const bcrypt = require('bcrypt');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: '12345',
    database: 'smart-brain'
  }
});


const app = express();
const PORT = 3003;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

app.post('/clarifai', async (req, res) => {

  console.log('Requisição recebida');
  console.log(req.body);

  const { imageUrl } = req.body;
  const PAT = '116907b4c07341c2a8033b100eba75ff';
  const USER_ID = 'c0sa6dsagsbp';
  const APP_ID = 'test';
  const MODEL_ID = 'face-detection';

  const requestBody = JSON.stringify({
    "user_app_id": {
      "user_id": USER_ID,
      "app_id": APP_ID
    },
    "inputs": [
      {
        "data": {
          "image": {
            "url": imageUrl
          }
        }
      }
    ]
  });

  try {
    const response = await fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/outputs`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Key ${PAT}`,
        'Content-Type': 'application/json'
      },
      body: requestBody
    });

    const data = await response.json();
    res.json(data);  // Envia o resultado de volta para o frontend
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erro ao processar a solicitação para a API da Clarifai' });
  }
});

app.get('/', (req, res) => { res.send('success'); });
app.post('/signin', signin.handleSignin(db, bcrypt));
app.post('/register', register.handleRegister(db, bcrypt, saltRounds));
app.get('/profile/:userId', profile.handleProfileGet(db));
app.put('/image', image.handleImage(db));

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
