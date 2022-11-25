require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.Port || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.REACT_APP_DBUSER}:${process.env.REACT_APP_DBPASSWORD}@cluster0.7grdkwx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const categoriesCollection = client.db('smoky-tyres').collection('categories');
        const carsCollection = client.db('smoky-tyres').collection('cars');

        app.get('/categories', async(req,res)=>{
            const query= {};
            const categories= await categoriesCollection.find(query).toArray();
            res.send(categories);
        })

        app.get('/cars', async(req,res)=>{
            const query= {};
            const categories= await carsCollection.find(query).toArray();
            res.send(categories);
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