const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    process.exit(1);
})
// ENVIRONMENT VARIBLE FILE PATH
dotenv.config({ path: './config.env' })


// DATABASE CONNECTIONS
const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log("DATABASE connection successfully");
})



// const testTour = new Tour({
//     name: "The forest",
//     price: 999
// });

// testTour.save().then(d => console.log(d)).catch(err => console.log(err));



// console.log(process.env.PORT)
// console.log(process.env.USERNAME)
// console.log(process.env.PASSWORD)
// console.log(process.env.NODE_ENV)
// console.log(process.env);

//SERVER LISTEN ON PORT 3000
const server = app.listen(3000, () => {
    console.log(process.env.NODE_ENV + "mode");
    console.log("app running on port 3000");
})

process.on('unhandledRejection', err => {
    // console.log(err.name);
    console.log(err.message);
    server.close(() => {
        process.exit(1);
    })
})

// console.log(x);n

