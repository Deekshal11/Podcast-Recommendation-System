const express = require("express");
const app= express();
const mongoConnection = require("./DB");
const cors = require("cors");
const adminRoutes = require('./routes/AdminRoutes');
const creatorRoutes = require('./routes/CreatorRoutes');
const listenerRoutes = require('./routes/ListenerRoutes');
const path = require('path');

//call the mongo connection function
mongoConnection();

const PORT = 7007;
app.use(cors())

//middleware to read json
app.use(express.json());

//default route to check server status
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});

//test route
app.get("/", (req, res)=>{
    res.send("Server is up and running!");
});

app.use('/api/users', require('./routes/UserRoutes'));
app.use('/api/admin', adminRoutes);
// Add these
app.use('/api/creator', creatorRoutes);
app.use('/api/listener', listenerRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//backend flow should be like this
//schemas/models -> controllers -> routes -> index.js (server.js/app.js)
//1. create schema/model (blueprint of collection) in models folder
//2. create controller to handle all the logic in controller folder
//3. create routes to define all the routes in routes folder
//4. bring all the routes in index.js (server.js/app.js) and use them as middleware