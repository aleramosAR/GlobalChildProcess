import fs from 'fs';
import express from 'express';
import handlebars from 'express-handlebars';
import fetch from "node-fetch";
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import session from "express-session";
import bCrypt from 'bcrypt';
import passport from "passport";
import { Strategy as FacebookStrategy} from 'passport-facebook';
import {PORT, MONGO_URI, FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET} from './utils.js';
import prodRoutes from './routes/ProductRoutes.js';
import mensRoutes from './routes/MensajesRoutes.js';
import frontRoutes from './routes/FrontRoutes.js';


const processParams = process.argv.slice(2);
const facebookID = processParams[0] ?? FACEBOOK_CLIENT_ID;
const facebookSecret = processParams[1] ?? FACEBOOK_CLIENT_SECRET;


(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
    	useUnifiedTopology: true,
    	useCreateIndex: true,
			useFindAndModify: false
    });
    console.log("Base de datos conectada");
		// Una vez conectado me conecto al socket porque este levanta al iniciar datos de la base
		connectSocket();
  } catch (err) {
    console.log(err.message);
  }
})();

const app = express();

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(cookieParser())
app.use(
	session({
		store: MongoStore.create({
			mongoUrl: MONGO_URI,
			mongoOptions: {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			},
		}),
		secret: 'clavesecreta',
		resave: false,
		saveUninitialized: false,
    rolling: true,
		cookie: { maxAge: 600 * 1000 },
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', frontRoutes);
app.use('/api/productos', prodRoutes);
app.use('/api/mensajes', mensRoutes);
app.get('*', function (req, res) { res.render('404'); });

app.engine('hbs', handlebars({
  extname: 'hbs',
  defaultLayout: 'layout.hbs'
}));
app.set("views", "./views");
app.set('view engine', 'hbs');

app.use(passport.initialize());
app.use(passport.session());


passport.use(new FacebookStrategy({
    clientID: facebookID,
    clientSecret: facebookSecret,
    callbackURL: '/auth/facebook/callback',
		enableProof: true,
    profileFields: ['id', 'displayName', 'photos', 'emails'],
    scope: ['email']
}, function (accessToken, refreshToken, userProfile, done) {
    return done(null, userProfile);
}));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (usuario, done) {
	return done(null, usuario);
});



// Funcion que carga los productos y emite el llamado a "listProducts"
async function getProducts() {
	try {
		const response = await fetch("http://localhost:8080/api/productos");
		io.sockets.emit("listProducts", await response.json());
	} catch (err) {
		console.log(err);
	}
};

// Funcion que devuelve el listado de mensajes
async function getMensajes() {
	try {
		const response = await fetch("http://localhost:8080/api/mensajes");
		io.sockets.emit("listMensajes", await response.json());
	} catch (err) {
		console.log(err);
	}
};

function connectSocket() {
	io.on("connection", (socket) => {
		console.log("Nuevo cliente conectado!");
		getProducts();
		getMensajes();

		/* Escucho los mensajes enviado por el cliente y se los propago a todos */
		socket.on("postProduct", () => {
			getProducts();
		}).on("updateProduct", () => {
			getProducts();
		}).on("deleteProduct", () => {
			getProducts();
		}).on("postMensaje", data => {
			getMensajes();
		}).on('disconnect', () => {
			console.log('Usuario desconectado')
		});
	});
}

// Conexion a server con callback avisando de conexion exitosa
httpServer.listen(PORT, () => { console.log(`Ya me conecte al puerto ${PORT}.`); })
.on("error", (error) => console.log("Hubo un error inicializando el servidor.") );