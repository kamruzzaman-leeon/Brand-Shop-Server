const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jfba5ry.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // connect to Atlas cluste & collection
        const ProductCollection = client.db('BrandShopDB').collection('product')
        const BrandCollection = client.db('BrandShopDB').collection('brand')

        //data create
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await ProductCollection.insertOne(newProduct);
            res.send(result);

        })

        // brand get from database
        app.get('/brand', async (req, res) => {
            const cursor = BrandCollection.find();
            const result = await cursor.toArray()
            res.send(result);
        })

        // data read
        app.get('/product', async (req, res) => {
            const cursor = ProductCollection.find()
            const result = await cursor.toArray();
            res.send(result);
        })

        // data read for a specific brand
        app.get('/product/:brand', async (req, res) => {
            const encodeBrand = req.params.brand;
            const brand = decodeURIComponent(encodeBrand);
            const query = { brand: brand };
            const result = await ProductCollection.find(query).toArray();
            res.send(result)
        })

        // data read for a specific product
        app.get('/productdetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ProductCollection.findOne(query);
            console.log(result)
            res.send(result);
        })
   





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
}
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('BrandShop server is running!')
})

app.listen(port, () => {
    console.log(`server is running on port: ${port}`)
})