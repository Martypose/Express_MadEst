const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../lib/db');
const helpers = require('../lib/helpers');

passport.use('local.login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req,username,password,done)=> {
 const newUser = {
    username,
    password
 };
 newUser.password = helpers.encryptPassword(password);
const result = await pool.query('INSERT INTO usuarios SET ?', [newUser]);
console.log(result);
}));


//passport.serializeUser((user,done) => {


//});