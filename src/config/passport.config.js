import passport from 'passport';
import local from 'passport-local';
import GithubStrategy from 'passport-github2';
import { createUser, getAll, getByEmail, getById } from '../DAO/UserDAO.js';
import { createHash, isValidPassword } from '../utils/index.js';

const LocalStrategy = local.Strategy;

export const initializePassport = () => {
    passport.use("register", new LocalStrategy(
        {passReqToCallback: true, usernameField: "email"}, async (req, username, password, done) => {
            try{
                let user = req.body;
                let userFound = await getByEmail(user.email);
                if (userFound) {
                    return done(null, false);
                }
                user.password = createHash(user.password);
                let result = await createUser(user);
                console.log(result);
                return done(null, result);
            }
            catch(error){
                return done(error + "Error al registrar usuario");
            }
            
        }
    ));

    passport.use("login", new LocalStrategy( {usernameField: "email"}, async (username, password, done) =>{
        let result = await getByEmail(username);
        if (!result || !isValidPassword(result, password)) {
            return done(null, false);
        }
        delete result.password;
        return done(null, result);
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    })
    passport.deserializeUser(async (id, done) => {
        let user = await getById(id);
        done(null, user);
    })
}

export const initializePassportGithub = () => {
    passport.use("github", new GithubStrategy({
        clientID: "Iv1.ca2928a6115608d1",
        clientSecret: "70cef6b1d3952157b3611d15e443291be2d3f96f",
        callbackURL: "http://localhost:8080/api/session/gitcallback",
        scope: ["user.email"]

    }, async (accessToken, refreshToken, profile, done) => {
        try{
            console.log(profile);
            let userEmail = profile.emails[0].value;
            let user = await getByEmail(userEmail);
            if (!user) {
                let newUser = {
                    first_name: profile._json.login,
                    last_name: "",
                    email: userEmail,
                    password: ""
                }
                let result = await createUser(newUser);
                done(null, result);
            }else{
                done(null, user);
            }
        }catch(error){
            done(error);
        }
    }))

passport.serializeUser((user, done) => {
    done(null, user._id)
});

passport.deserializeUser(async (id, done) => {
    let user = await getById(id);
    done(null, user);
})
}

