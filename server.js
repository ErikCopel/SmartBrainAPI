const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const bcrypt = require('bcrypt');
const knex = require('knex');

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
const PORT = 3003   ;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

function isPasswordValid(password, hash) {
  return bcrypt.compareSync(password, hash);
}

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

app.get('/', (req, res) => {
  res.send(database.users);
});

app.post('/signin', (req, res) => {
  // find user in database
  const user = database.users.find(user => user.email === req.body.email);  

  if (!user || !isPasswordValid(req.body.password, user.password)) {
    return res.status(400).json('Incorrect email or password');
  } else {
    res.json(user);
  }
});

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  db('users')
    .returning('*')
    .insert({
      email: email,
      name: name,
      joined: new Date()
  })
    .then(user => {
      res.json(user[0]);
  })
    .catch(err => res.status(400).json('unable to register'));
});

app.get('/profile/:userId', (req, res) => {
  const { userId } = req.params;

  db.select('*').from('users').where({id: userId})
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(404).json('error getting user');
      }
    });
});

app.put('/image', (req, res) => {
  const { userId } = req.body;
  console.log("USER ID:", userId);
  db('users').where('id', '=', userId)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to get entries'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
