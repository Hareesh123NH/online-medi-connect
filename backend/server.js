const express=require('express');
const app=express();
require('dotenv').config();

const mongoose = require("mongoose");
const PORT=process.env.PORT;

// 👉 Middleware
const authMiddleware = require("./middlewares/authMiddleware");


//Routes
const patientRoutes=require('./routers/patientRouter');
const authRouter=require("./routers/authRouter");
const adminRouter=require("./routers/adminRouter");
const doctorRouter=require("./routers/doctorRouter");

app.use(express.json());
app.use('/patient',patientRoutes);
app.use('/auth',authRouter);
app.use('/admin',authMiddleware("admin"),adminRouter)
app.use("/doctor",doctorRouter)


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected..."))
.catch(err => console.error("❌ MongoDB Connection Error:", err));


app.listen(PORT,()=>{
    console.log(`server is listening at http://localhost:${PORT}`);
}); 