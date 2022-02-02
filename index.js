const express = require('express');
const app = express();
const port = 5000;
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var views = process.cwd() + "/views/";


const db = require('./config/db');
var usersRouter = require('./routes/users.route');
var adminRouter = require('./routes/admin.route');
var apiRouter = require('./routes/api.route');

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 
app.set('views', path.join(__dirname, '/views'));
app.use('/user', usersRouter);
app.use('/admin', adminRouter);
app.use('/api', apiRouter);
app.set('view engine', 'pug')

app.get('/', (req, res) => {
    res.sendFile(views + '/index.html');
});

app.get('/novo', (req, res) => {
	res.sendFile(views + '/novo.html');
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});