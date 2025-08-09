const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const admin = require("firebase-admin");

const decoded =Buffer.from(process.env.FB_SERVICE_KEY,'base64').toString('utf8');
const serviceAccount = JSON.parse(decoded);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b4gl5td.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers?.authorization;
  console.log(authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  const token = authHeader.split(" ")[1];
  console.log(token)
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("decoded token", decoded);
    req.decoded = decoded;
    next();
  } catch (error) {
    return res.status(401).send({ message: "unauthorized access" });
  }
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const itemsCollection = client.db("foodTracker").collection("items");
    const notesCollection = client.db("foodTracker").collection("notes");

    app.get("/items", async (req, res) => {
      const today = new Date();
      const fiveDaysLater = new Date();
      fiveDaysLater.setDate(today.getDate() + 5);
      const nearlyExpiryItems = await itemsCollection
        .find({
          expiryDate: {
            $gte: today,
            $lte: fiveDaysLater,
          },
        })
        .sort({ expiryDate: 1 })
        .limit(6)
        .toArray();

      res.send(nearlyExpiryItems);
    });

    app.get("/expiredItems", async (req, res) => {
      const today = new Date();
      const expiredItems = await itemsCollection
        .find({ expiryDate: { $lt: today } })
        .toArray();
      res.send(expiredItems);
    });
          

    app.get("/items", verifyFirebaseToken,async (req, res) => {
      const email = req.query.email;
       if (email !== req.decoded.email){
          return res.status(403).message({ message: "forbidden access" });
       }
      const items = await itemsCollection.find({ userEmail: email }).toArray();      
      res.send(items);
    });   

    app.get("/foods",verifyFirebaseToken, async (req, res) => {
      const { userEmail } = req.query;
      const filter = userEmail ? { userEmail } : {};
      const items = await itemsCollection.find(filter).toArray();
      res.send(items);
    });

    app.post("/foods", verifyFirebaseToken, async (req, res) => {
      const newFood = req.body;
      console.log(newFood);
      if (newFood.userEmail !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const result = await itemsCollection.insertOne(newFood);
      res.send(result);
    });      
    

    // GET foods by userEmail
    app.get("/foods", async (req, res) => {
      const email = req.query.userEmail;
      const result = await itemsCollection.find({ userEmail: email }).toArray();
      res.send(result);
    });
    app.post("/notes", async (req, res) => {
      const note = {
        foodId: new ObjectId(req.body.foodId),
        userEmail: req.body.userEmail,
        noteText: req.body.noteText,
        noteDate: new Date(),
      };
      const result = await notesCollection.insertOne(note);
      res.send(result);
    });
    app.get("/notes/:foodId", async (req, res) => {
      const foodId = req.params.foodId;
      const notes = await notesCollection
        .find({ foodId: new ObjectId(foodId) })
        .sort({ noteDate: -1 })
        .toArray();
      res.send(notes);
    });
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const food = await itemsCollection.findOne({ _id: new ObjectId(id) });
      res.send(food);
    });

    // search fridge
    app.get("/fridge-foods", async (req, res) => {
      const { userEmail, search } = req.query;
      console.log(search);
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }

      const foods = await itemsCollection.find(query).toArray();
      res.send(foods);
    });

    // filter fridge

    app.get("/foodsCategory", async (req, res) => {
      const { category } = req.query;

      const filter = {};

      if (category && category !== "All") {
        filter.category = category;
      }

      const foods = await itemsCollection.find(filter).toArray();
      res.send(foods);
    });

    // PUT (update)
    app.put("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await itemsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.send(result);
    });
    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const result = await itemsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Food Tracker is Testing");
});

app.listen(port, () => {
  console.log(`Food Tracker is running on port ${port}`);
});