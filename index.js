const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttlimcj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("toyDb").collection("users");
    const toyCollection = client.db("toyDb").collection("toys");

    // get
    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find().toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/my-toy/:email", async (req, res) => {
      const email = req.params.email;
      const query = { sellerEmail: email };
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    // post
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) return res.send({ message: "already exists" });

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.post("/toy", async (req, res) => {
      const toy = req.body;

      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });

    // patch
    app.patch("/update-toy", async (req, res) => {
      const updateInfo = req.body;
      const id = updateInfo.id;
      const query = { _id: new ObjectId(id) };
      let toy = await toyCollection.findOne(query);
      if (toy) {
        toy = {
          $set: {
            price: updateInfo.price,
            availableQuantity: updateInfo.availableQuantity,
            detailDescription: updateInfo.detailDescription,
          },
        };
      } else return res.send({ error: "class not found" });

      const result = await toyCollection.updateOne(query, toy);
      res.send(result);
    });

    // delete
    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection]
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy is playing");
});

app.listen(port, () => {
  console.log(`Toy is playing on on port ${port}`);
});
