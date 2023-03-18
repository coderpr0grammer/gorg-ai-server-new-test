const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const port = 3001;
require("dotenv").config({ path: require("find-config")(".env") });
const cors = require("cors");
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const dialogExample = [
  {
    speaker: "user",
    text: "Hello, how are you?",
  },
  {
    speaker: "bot",
    text: "I am doing well, thank you. How can I help you today?",
  },
];

async function freeRequest(req) {
  
  let conversationBody = "";

  const messagesTest = [
     {
      "_id": 1,
      "createdAt": '2023-03-18T20:48:42.322Z',
      "text": "Hey Daniel! My name's Gorg! I'm your personal chat buddy, how are you?",
      "user":  {
        "_id": 5,
        "avatar": 8,
        "name": "Gorg",
      },
    },
     {
      "_id": "4e061363-f6c0-4893-88b7-5e43e2c5c705",
      "createdAt": '2023-03-18T20:48:47.392Z',
      "text": "Hey gorg",
      "user":  {
        "_id": 1,
      },
    },
  ]

  req.messages.forEach((messageNode) => {
    if (messageNode.user._id == 5) {
      //message is from ai
      conversationBody += "\nGorg:";
      conversationBody += messageNode.text;
    } else {
      //message is from user
      conversationBody += " \nHuman:&nbsp;";
      conversationBody += messageNode.text;
      conversationBody += " \nGorg:&nbsp;";
    }
  });

  const name = req.name;
  const prompt = `The following is a conversation between you, an AI chat buddy named Gorg and a human ${name}. The buddy is helpful, creative, clever, very friendly and applies psychology to help the human, however does not under any circumstances provide medical advice, talk about treatment, or give medical information, or talk about sexual topics.`;
  const promptToSend = prompt + conversationBody;
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: promptToSend,
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [" Human:", " AI:"],
  });
  return { result: completion.data.choices[0].text };
}

app.get("/api", (req, res) => {
  request(req.query.prompt)
    .then((result) => {
      res.json(result);
    })
    .then((data) => {
      output = data;
      console.log(data);
    });
});

app.post("/api", (req, res) => {
  console.log(req.body);
  let output = null;
  // res.send("hi")
  // let output = request().then((result) => console.log(result))
  if (req.body.hasBBG) {
  } else {
    freeRequest(req.body)
      .then((result) => {
        res.json(result);
      })
      .then((data) => {
        output = data;
        console.log(data);
      });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
