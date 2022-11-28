require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.Port || 5000;

const stripe = require("stripe")(process.env.REACT_KEY_STRIPE_SK);

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.REACT_APP_DBUSER}:${process.env.REACT_APP_DBPASSWORD}@cluster0.7grdkwx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const categoriesCollection = client.db('smoky-tyres').collection('categories');
        const carsCollection = client.db('smoky-tyres').collection('cars');
        const userCollection = client.db('smoky-tyres').collection('user');
        const testDriveCollection= client.db('smoky-tyres').collection('test-drive')
        const paymentsCollection= client.db('smoky-tyres').collection('payments')

        app.get('/categories', async(req,res)=>{
            const query= {};
            const categories= await categoriesCollection.find(query).toArray();
            res.send(categories);
        })

        // Cars

        app.get('/cars/:categoryid', async(req,res)=>{
            const categoryId= req.params.categoryid;
            const filter= {category:categoryId};
            const result= await carsCollection.find(filter).toArray();
            res.send(result)
        })

        app.get('/cars', async(req,res)=>{
            const query= {};
            const cars= await carsCollection.find(query).toArray();
            res.send(cars);
        })

        app.get('/cars/email/:email', async(req,res)=>{
            const email= req.params.email;
            const query= {sellerEmail:email};
            const result= await carsCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/cars/id/:id', async(req,res)=>{
            const id= req.params.id;
            const filter= {_id: ObjectId(id)};
            const result= await carsCollection.findOne(filter);
            res.send(result);
        })

        app.post('/cars', async(req,res)=>{
            const car= req.body;
            const result= await carsCollection.insertOne(car);
            res.send(result)
        })

        // Users

        app.get('/users', async (req,res)=>{
            const query= {};
            const allUsers= await userCollection.find(query).toArray();
            res.send(allUsers)
        })

        app.get('/users/:email', async (req,res)=>{
            const email=req.params.email;
            const query= {email: email};
            const result= await userCollection.findOne(query);
            res.send(result)
        })

        app.post('/users', async (req, res)=>{
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result)
        })

        // Test Drive Booking

        app.post('/testdrivebooking', async(req,res)=>{
            const booking= req.body;
            const result= await testDriveCollection.insertOne(booking);
            res.send(result)
        })

        app.delete('/testdrivebooking/:id', async (req,res)=>{
            const id= req.params.id;
            const query = {_id: ObjectId(id)};
            const result= await testDriveCollection.deleteOne(query);
            res.send(result)
        })

        app.get('/testdrivebooking/:id', async (req,res)=>{
            const id= req.params.id;
            const query = {_id: ObjectId(id)};
            const result= await testDriveCollection.findOne(query);
            res.send(result)
        })

        app.get('/testdrivebooking/buyer/:email', async(req,res)=>{
            const email= req.params.email;
            const filter= {buyerEmail:email };
            const buyerAllBooking= await testDriveCollection.find(filter).toArray();
            res.send(buyerAllBooking)
        })

        // Stripe / Payment

        app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;
            const price2= price*100;
            const paymentIntent = await stripe.paymentIntents.create({
              amount: price2,
              currency: "usd",
              payment_method_types: ['card']
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        })

        app.post('/payment', async(req,res)=>{
            const payment= req.body;
            const result= await paymentsCollection.insertOne(payment);

            const id= payment.bookingId;
            const filter= {_id:ObjectId(id)};
            const updateDoc={
                isPaid: true   
            }
            const update= await testDriveCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        
    }
    finally{

    }
}
run()


app.get('/', (req,res) =>{
    res.send('Port is running')
});

app.listen(port, () =>{
    console.log(`port ${port}`)
})