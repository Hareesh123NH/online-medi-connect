const express=require('express');
const app=express();
require('dotenv').config();

const mongoose = require("mongoose");
const PORT=process.env.PORT;


//Routes
const patientRoutes=require('./routers/patientRoutes');
const auth=require("./controllers/auth");

app.use(express.json());


app.use('/patient',patientRoutes);
app.use('/auth',auth);


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected..."))
.catch(err => console.error("❌ MongoDB Connection Error:", err));


app.listen(PORT,()=>{
    console.log(`server is listening at http://localhost:${PORT}`);
}); 