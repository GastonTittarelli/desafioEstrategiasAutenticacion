import passport from 'passport';
import local from 'passport-local';
import { createUser, getAll, getByEmail, getById } from '../DAO/UserDAO.js';
import { createHash, isValidPassword } from '../utils/index.js';

const LocalStrategy = local.Strategy;

const initializePassport = () => {
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

export default initializePassport;