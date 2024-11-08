const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3003   ;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

function isPasswordValid(password, hash) {
  return bcrypt.compareSync(password, hash);
}

const database = {
  users: [
    {
      id: '123',
      name: 'John',
      email: 'john@gmail.com',
      password: '$2b$10$RWR16kxzP.m91B7xVa7xce26zznQBmmxqQmp3Qm06m/G3zn2FXKj6', // cookies
      entries: 0,
      joined: new Date()
    },
    {
      id: '124',
      name: 'Sally',
      email: 'sally@gmail.com',
      password: '$2b$10$QJmNskE2h6o.nlmfqKKGzuNyCqFmogXEHQFKBGkMxok9t73eacsbW', // bananas
      entries: 0,
      joined: new Date()
    }
  ]
};

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
  if (req.body.email === database.users[0].email &&
    isPasswordValid(req.body.password, database.users[0].password)) {
      res.status(200).json(database.users[0]);
  } else {
    res.status(400).json('error logging in');
  }
});

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  database.users.push({
    id: '125',
    name: name,
    email: email,
    password: bcrypt.hashSync(password, saltRounds),
    entries: 0,
    joined: new Date()
  });
  //return the registered user
  res.json(database.users[database.users.length - 1]);
});

app.get('/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const user = database.users.find(user => user.id === userId);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json('user not found');
  }
});

app.put('/image', (req, res) => {
  const { userId } = req.body;
  const user = database.users.find(user => user.id === userId);

  if (user) {
    user.entries++;
    res.json(user.entries);
  } else {
    res.status(404).json('user not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
