const express = require('express');
// const serverless = require('serverless-http');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const router = express.Router();

const config = require('./config');

const userRoutes = require('./routes/user-routes');
const quizRoutes = require('./routes/quiz-routes');
const adminRoutes = require('./routes/admin-routes');
// const firebase = require('firebase');
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));

router.use('/user', userRoutes.routes);
router.use('/quiz', quizRoutes.routes);
router.use('/admin', adminRoutes.routes);
// app.use(expressSession({
//     secret: 'sfjalskfjalkjsdfklasd',
//     resave: false,
//     saveUninitialized: false
// }));

// app.listen(config.port, ()=>{console.log(`listening on port ${config.port}`);})
app.use('/.netlify/functions/api', router);

// // module.exports = app;
module.exports.handler = serverless(app);