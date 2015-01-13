//Chat simple con socket.io

var express = require ('express'),
	app = express(),
	//Creamos un servidor http
	server = require('http').createServer(app),
	//Socket.io escucha en el server
	io = require('socket.io').listen(server),
	users = {};

app.use(express.static(__dirname + '/public'));


server.listen(3000);

//Peticion a la raiz, devolvemos un fichero index.html en la raiz del proyecto
app.get('/', function (req, res) {
	res.send('index.html');
});

//Hacemos que socketio escuche los eventos
io.sockets.on('connection', function(socket){
	//Cuando recibimos un nuevo usuario
	socket.on('new user', function (data, callback){
		//Verificamos si el nick ya existe en el array
		//Si existe
		if(data in users){
			callback(false);
		} 
		//Si no existe
		else {
			callback(true);
			socket.nickname = data;
			//Añadimos el nick a los nicks registrados
			users[socket.nickname] = socket;
			//Informamos a todos de los usuarios registrados
			updateNicknames();
		}

	});

	function updateNicknames(){
		//Enviamos los nicks de todos los usuarios. Usamos las keys dado que el nick es la key del objeto
		io.sockets.emit('usernames', Object.keys(users));
	}


	//Cuando recibimos un mensaje
	socket.on('send message', function (data, callback) {

		var msg = data.trim();
		if(msg.substr(0,3) === '\\w '){
			
			msg = msg.substr(3);
			//Verificamos si tras el usuario
			var ind = msg.indexOf(' ');
			if(ind !== -1){
				//Verificamos si el usuario existe
				var name = msg.substr(0, ind);
				var msg = msg.substr(ind + 1);
				if(name in users){
					
					if(name != socket.nickname){
						console.log('Whisper');
						users[name].emit('whisper', {msg: msg, nick: socket.nickname});
					}else {
						callback({error: 'Error: no te puedes enviar mensajes a ti mismo'});
					}
				} else {
					callback({error: 'Error: escribe un usuario valido'});
				}
			} else {
				//Si no tenemos espacios tras el \w
				callback({error: 'Error: por favor, escribe un mensaje privado para tu usuario'});
			}	
		}else {
			//Emitimos el mensaje a todos excepto a mi, indicando el nick de quien lo envía
			socket.emit('new message', { msg:msg, nick: socket.nickname });
		}
	});

	//Desconexion de un usuario
	socket.on('disconnect', function (data){
		//Si no existe
		if(!socket.nickname) return;
		//Si existe lo eliminamos del objeto de usuarios
		delete users[socket.nickname];
		updateNicknames();
	});
});