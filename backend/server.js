const express=require('express');
const app=express();
require('dotenv').config();
const PORT=process.env.PORT;

//Routes
const patientRoutes=require('./routers/patientRoutes');
const auth=require("./controllers/auth");

app.use(express.json());


app.use('/patient',patientRoutes);
app.use('/auth',auth);


app.listen(PORT,()=>{
    console.log(`server is listening at http://localhost:${PORT}`);
}); 