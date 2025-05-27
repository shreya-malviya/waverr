// env setup
const dotenv = require('dotenv');
dotenv.config()

const connectDatabase = require('./config/database')
const errorMiddleware = require('./middleware/error');
//conncting to the database
connectDatabase()

const session = require('express-session');
const passport = require('passport');

const {server,app}  = require('./app')
// Routes

// Session & Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());


const users = require('./routes/userR');
const googleAuthRoutes = require('./routes/authR');
const sidebarRoutes = require('./routes/sidebarR');
const sendMessages = require('./routes/messageR');
const profiles = require('./routes/profileR');
const calls = require('./routes/callR');
const posts = require('./routes/post.route')

app.use('/api/v1', users);
app.use('/', googleAuthRoutes);
app.use('/api/v1', sidebarRoutes);
app.use('/api/v1', sendMessages);
app.use('/api/v1', profiles);
app.use('/api/v1', calls);
app.use('/api/v1',posts);

// Error middleware
app.use(errorMiddleware);

// handling uncaught exception
process.on("uncaughtException", (err) => {
    console.log(`error: ${err.message}`);
    console.log(`shutting down the server due to uncaught exception error`);
    process.exit(1);
})




const PORT = process?.env?.PORT ?? 8080;
const host = process?.env?.HOST ?? "http://localhost"
server.listen(PORT, () => {
    console.log(`server is working on ${host}:${PORT}`)
})


//unhandled promise rejection 
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to unhandled promise rejection`);
    server.close(() => {
        process.exit(1);
    });

})
