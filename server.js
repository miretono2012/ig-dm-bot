// server.js
// Bot de auto-respuesta para Instagram DMs
// Usa la API oficial de Instagram Messaging (Meta Graph API)

const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GRAPH_API_VERSION = 'v21.0';

function loadRules() {
  const rulesPath = path.join(__dirname, 'rules.json');
  const raw = fs.readFileSync(rulesPath, 'utf-8');
  return JSON.parse(raw);
}

function findReply(text, rules) {
  if (!text) return rules.default_reply;
  const normalized = text.toLowerCase().trim();
  for (const rule of rules.rules) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        return rule.reply;
      }
    }
  }
  return rules.default_reply;
}

async function sendInstagramMessage(recipientId, messageText) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  const body = {
    recipient: { id: recipientId },
    message: { text: messageText },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Error al enviar mensaje a Instagram:', data);
    } else {
      console.log('Mensaje enviado correctamente:', data);
    }
  } catch (err) {
    console.error('Error de red al enviar mensaje:', err);
  }
}

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado correctamente.');
    res.status(200).send(challenge);
  } else {
    console.warn('Falló la verificación del webhook.');
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  const body = req.body;

  console.log('--- Webhook POST recibido ---');
  console.log(JSON.stringify(body, null, 2));

  res.status(200).send('EVENT_RECEIVED');

  if (body.object !== 'instagram') {
    console.log('Ignorado: body.object no es "instagram", es:', body.object);
    return;
  }

  const rules = loadRules();

  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      const senderId = event.sender?.id;
      const messageText = event.message?.text;

      if (event.message?.is_echo) continue;
      if (!senderId || !messageText) continue;

      console.log(`Mensaje recibido de ${senderId}: "${messageText}"`);

      const reply = findReply(messageText, rules);
      sendInstagramMessage(senderId, reply);
    }
  }
});

app.get('/', (req, res) => {
  res.send('Bot de Instagram DMs funcionando correctamente.');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
