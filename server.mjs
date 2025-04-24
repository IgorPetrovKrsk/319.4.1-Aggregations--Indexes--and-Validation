import express from 'express'
import dotenv from 'dotenv'
import gradeRouters from './routes/gradeRoutes.mjs'


dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use('/grades',gradeRouters);

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);    
});