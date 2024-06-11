const express = require('express');
const axios = require('axios');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;


const users = [];


app.use(express.urlencoded({ extended: true }));


app.set('view engine', 'ejs');


app.use(express.static('public'));


app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));


const API_KEY = './key.json';


app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
        const movies = response.data.results;
        res.render('index', { movies: movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.send('Error fetching movies');
    }
});


app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.redirect('/login');
});


app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user.username;
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});


app.get('/dashboard', (req, res) => {
    if (req.session.userId) {
        res.render('dashboard', { username: req.session.userId });
    } else {
        res.redirect('/login');
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
