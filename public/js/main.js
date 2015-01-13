$( document ).ready(function() {
	var socket = io.connect();

	//Variables del chat
	var $messageForm = $('#send-message');
	var $messageBox = $('#message');
	var $chat = $('#chat');

	//Variables del nick
	var $nickForm = $('#setNick');
	var $nickError = $('#nickError');
	var $nickBox = $('#nickname');
	var $users =  $('#users');

	//Nuevo nick
	$nickForm.submit(function (e){
		e.preventDefault();
		socket.emit('new user', $nickBox.val(), function (data){
			if(data){
				$('#nickWrap').hide();
				$('#contentWrap').show();
			} else {
				$nickError.html('Ese usuario ya esta cogido. Prueba con otro');
			}
		});
		$nickBox.val('');
	})

	//Envioo de un mensaje
	$messageForm.submit(function (e){
		e.preventDefault();
		//Si hay un mensaje escrito
		if($messageBox.val()){

            //Recuperamos el mensaje y eliminamos los espacios en blanco al principio y al final
            var message = $messageBox.val();
            
            socket.emit('send message', $messageBox.val(), function(data){
                if(data.error){
                    $chat.append("<div class='errormessage'>"+ data.error + "<hr></div>");
                } else {
                    $chat.append("<div class='mymessage'>"+ $messageBox.val() + "<hr></div>");
                }
            });
            
	
			$messageBox.val('');
		}
        $("#chat").animate({ scrollTop: $(document).height() }, "slow");
	});

	//Nuevo mensaje
	socket.on('new message', function (data){
		//Si recibimos un mensaje
		if(data.msg){
			$chat.append("<div class='usermessage'><b>"+ data.nick + ": </b>" + data.msg + "<hr></div>");
		}
	});

	//Todos los usuarios
	socket.on('usernames', function (data){
		var html= '';
		for (i=0; i< data.length; i++){
			html += data[i] + '<br>';
		}
		$users.html(html);
	});

    //Susurro
    socket.on('whisper', function (data){
        if(data.msg){
            $chat.append("<div class='whisper'><b>"+ data.nick + ": </b>" + data.msg + "<hr></div>");
        }
    });       		
});
