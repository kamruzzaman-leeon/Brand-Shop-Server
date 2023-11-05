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
        const CartCollection = client.db('BrandShopDB').collection('cart')

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

        //all product read 
        app.get('/product', async (req, res) => {
            const cursor = ProductCollection.find()
            const result = await cursor.toArray();
            res.send(result);
        })

        // data read for a specific brand
        app.get('/productbrand/:brand', async (req, res) => {
            const encodeBrand = req.params.brand;
            const brand = decodeURIComponent(encodeBrand);
            const query = { brand: brand };
            const result = await ProductCollection.find(query).toArray();
            res.send(result)
        })

        // data read for a specific product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ProductCollection.findOne(query);
            // console.log(result)
            res.send(result);
        })

        // product data update
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateProduct = req.body;

            const product = {
                $set: {
                    product: updateProduct.product,
                    productImageUrl: updateProduct.productImageUrl,
                    brand: updateProduct.brand,
                    productType: updateProduct.productType,
                    price: updateProduct.price,
                    rating: updateProduct.rating,
                    description: updateProduct.description,
                },
            };

            const result = await ProductCollection.updateOne(filter, product, options);
            console.log(result)
            res.send(result)
        })

        app.post('/mycart',async(req,res)=>{
            const cartItem = req.body;
            console.log(cartItem);
            const existingItem = await CartCollection.findOne({ product: cartItem.product, user: cartItem.user });
            
            if(existingItem){
                res.status(400).json({error:("item already in the cart")});
            }else{
                const result= await CartCollection.insertOne(cartItem);
                res.send(result)
            }
           

        })
        // all cart item read
        app.get('/mycart', async (req, res) => {
            const cursor = CartCollection.find()
            const result = await cursor.toArray();
            res.send(result);
        })

        app.delete('/mycart/:id',async(req,res)=>{
            
            const id =req.params.id;
            console.log(id)
            const query = {_id: new ObjectId(id) };
            const result = await CartCollection.deleteOne(query);
            console.log('data delete', result)
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