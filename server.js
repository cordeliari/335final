const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const app = express();
const portNumber = 9007;

app.set('views', __dirname + '/templates');

require("dotenv").config();
const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = { db: "CMSC335DB", collection: "campApplicants"};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

async function connect() {
  try {
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1
    });
    console.log("Successful connection to MongoDB");
    return client.db(databaseAndCollection.db);
  } catch (e) {
    console.error("Failed connection to MongoDB", e);
    throw e;
  }
}

async function addWord(wordInput, definitionInput) {
    try {
      const db = await connect();
      const result = await db
        .collection(databaseAndCollection.collection)
        .insertOne({ 
          word: wordInput, 
          definition: definitionInput
        });
      console.log(`Word '${wordInput}' added with definition`);
      return result;
    } catch (e) {
      console.error("Error occurred while inserting word", e);
      throw e;
    }
  }

// Serve the HTML file
app.get('/', (req, res) => {
  res.render('testhi.ejs');
});

app.get('/get-words', async (req, res) => {
    try {
      const db = await connect();
      const words = await db
        .collection(databaseAndCollection.collection)
        .find({})
        .toArray();
      res.json(words);
    } catch (error) {
      res.status(500).send(`Error retrieving words: ${error.message}`);
    }
  });

// Route to log searched words
app.post('/log-word', async (req, res) => {
    const { word, definition } = req.body;
  
    if (!word || !definition) {
      return res.status(400).send("Word and definition are required");
    }
  
    try {
      await addWord(word, definition);
      res.status(200).send(`Word '${word}' logged successfully`);
    } catch (error) {
      res.status(500).send(`Error logging word: ${error.message}`);
    }
  });

app.listen(portNumber, (err) => {
  if (err) {
    console.log("Starting server failed.");
  } else {
    console.log(`Server running at: http://localhost:${portNumber}`);
  }
});

