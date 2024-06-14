require('dotenv').config();
require('express-async-errors');
const golbalErrorHandler = require('./controllers/errorController')
// express
const express = require('express');
const app = express();

// database
const connectDB = require('./DB/connect');

// rest of the packages
const bodyParser = require('body-parser');

//  routers
const authRouter = require('./routes/auth');
const agencyRouter = require('./routes/agencyRoutes');
const tripRouter = require('./routes/tripRoutes');
const adminRouter = require('./routes/adminRoutes');
const reviewRouter = require('./routes/reviewRoutes');
// middleware
const trackingMiddleware = require('./middleware/trackingMiddleware')


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next();
});

app.use(bodyParser.json());
app.use(trackingMiddleware);

app.use('/auth', authRouter);
app.use('/agency',agencyRouter);
app.use('/trips',tripRouter);
app.use('/admin',adminRouter);
app.use('/review',reviewRouter)
console.log(process.env.NODE_ENV)
app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

const port = process.env.PORT || 8080;
const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};
app.use(golbalErrorHandler)
start();
