module.exports = function (passport) {

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function (user, done) {
        console.log('serializing user: '); console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        users.findById(id, function (err, user) {
            console.log('deserializing user:', user);
            done(err, user);
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);

}

//var bCrypt = require('bcrypt-nodejs');
/**------------------login--------------------**/

var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport){

	passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
            // check in mongo if a user with username exists or not
            users.findOne({ 'username' :  username }, 
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err)
                        return done(err);
                    // Username does not exist, log the error and redirect back
                    if (!user){
                        console.log('User Not Found with username '+username);
                        return done(null, false, req.flash('message', 'User Not found.'));                 
                    }
                    // User exists but wrong password, log the error 
                    if (!isValidPassword(user, password)){
                        console.log('Invalid Password');
                        return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
                    }
                    // User and password both match, return user from done method
                    // which will be treated like success
                    return done(null, user);
                }
            );

        })
    );


    //var isValidPassword = function(user, password){
    //    return bCrypt.compareSync(password, user.password);
    //}
    
}

/**------------------sign up--------------------**/