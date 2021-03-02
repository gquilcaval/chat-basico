
const  soket = io('http://localhost:3000')

let containerChat = document.getElementById('chat')
let chat = document.getElementById('chat-history')
let usuario = document.getElementById('usuario')
let user = document.getElementById('username')
let cajaMensaje = document.getElementById('message-to-send')
let btnSendMessage = document.getElementById('send')
let chatGrupal = document.getElementById('chat-grupal')
let nombre = document.getElementById('nombre')
let cajaActivos = document.getElementById('divActivos')
let conect = document.getElementById('conect')
let chatPersonal = document.getElementsByClassName('message other-message float-right')
var ul_activos = document.getElementById('list');
let destinatario = document.getElementById('chat-with')
let desconectar = document.getElementById('btnCerrarSesion')
var lblNotificacion ;

user.value = sessionStorage.getItem("user")
var chats =[];
var activos;
validarSesionExistente();
ul_activos.innerHTML="";


// ENVIANDO USUARIO EXISTENTE PARA QUE ACTUALIZE SU SOCKET_ID
soket.emit('newIdSocket', { name: sessionStorage.getItem("user")});





// ESCUCHANDO NUEVAS CONECCIONES DE USUARIOS
soket.on('activos',function(data) {
    if(user.value != "")
    {
        sessionStorage.setItem("activos",JSON.stringify(data))// creando session de usuarios conectados
        activos = JSON.parse(sessionStorage.getItem("activos"))// seteando array de la session de usuarios(ON)
        ul_activos.innerHTML="";


        for (var i = 0; i < data.length; i++) 
        {
            if(sessionStorage.getItem("user") != data[i].name){

                var name = data[i];
                var li = document.createElement('li');
                li.setAttribute("class","clearfix");
                li.innerHTML = `<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg" alt="avatar" />
                <div class="about">
                <div class="name">${name.name}</div>
                <div class="circulo">
                <h2>${name.notificacion}</h2>
                </div>
                <div class="status">
                <i class="fa fa-circle online"></i> online
                </div>
                </div>`;  
                ul_activos.appendChild(li);
            }
        
     
        }
        
        
    }
    
  
})
    
// ESCUCHANDO MENSAJES DEL GRUPO
soket.on('grupal', function(data) {
    
 chatGrupal.append(data.message+"\n")
    
})

// ESCUCHANDO MENSAJES INDIVIDUALES
soket.on('individual', function(data) {
    
    getMessages(data);

})




//FUNCION HABILITA BLOQUEO DE INPUT Y BUTTON AL CONECTARSE
function validarSesionExistente (){

    if(user.value != ""){
        user.disabled = true;
        conect.disabled = true;
        desconectar.disabled = false
        conect.style.backgroundColor = "rgb(180, 55, 55)"
    }
   
    
}
// FUNCION CLIK EN LOS USUARIOS CONECTADOS 
function getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement; 
}

ul_activos.onclick = function(event) {
    var target = getEventTarget(event);
    destinatario.innerHTML  = target.innerHTML// seteando visibilidad del destinatario conectado
    chat.innerHTML = ""
    containerChat.style.visibility = "visible"
    validarChatPrivado();

};

// DESCONECTAR SOCKET DE LADO DEL CLIENTE Y ELIMINANDO SESSION DEL USUARIO CONECTADO
desconectar.onclick = function(event) {

   soket.emit('deleteUser',{name: user.value})
   user.value = ""
  
   sessionStorage.removeItem('user')
   user.disabled = false;
   conect.disabled = false;
   ul_activos.innerHTML="";
   containerChat.style.visibility = "hidden"
   conect.style.backgroundColor = "#28B463"
};



// EVENTO CLICK - CONECCION AL SERVIDOR DEL NUEVO USUARIO
conect.addEventListener('click', function() {
    conect.style.backgroundColor = "rgb(180, 55, 55)"
    user.disabled = true;
    conect.disabled = true;
    sessionStorage.setItem("user", user.value);
   

    soket.emit('newIdUser', { name: user.value});// enviendo al servidor nuevo usuario
    
    alert("conexion exitosa")
    
})

// EVENTO CLICK - ENVIANDO NUEVO MENSAJE
btnSendMessage.addEventListener('click', function() {

    let message = { 
        text: cajaMensaje.value,//posible error
        to: destinatario.innerHTML, 
        me: sessionStorage.getItem("user")
    }
    let notificar = { 
        
        to: destinatario.innerHTML, 
        me: sessionStorage.getItem("user")
    }
    soket.emit('message',message)//enviando nuevo mensaje 
    soket.emit('notificar',notificar)
})

function getMessages(data)
{

    chat.innerHTML = ""
    
    if(data!=null)
    {
        chats.push(data)
    }

    sessionStorage.setItem("chats",JSON.stringify(chats))//creando session chats[] 

    chats.forEach(element => 
    {

        activos.forEach( activo =>
        {
            // EMISOR
            if(element.to == activo.name && destinatario.innerHTML == element.to)
            {
                        
                var node = document.createElement("li"); // Create a <li> node
                node.setAttribute("class","clearfix");
                node.innerHTML = `<div class="message-data align-right">
                <span class="message-data-time" >10:10 AM, Today</span> &nbsp; &nbsp;
                <i class="fa fa-circle me"></i>
                </div>
                <div class="message other-message float-right">
                ${element.text}
                </div>`;     
                chat.appendChild(node);
            }
              
           

            //RECEPTOR
            if(element.me == activo.name && destinatario.innerHTML == element.me)
            {

                var node = document.createElement("li");
                node.innerHTML = `<div class="message-data">
                <span class="message-data-time">10:12 AM, Today</span>
                </div>
                <div class="message my-message">${element.text}
                </div>`
                chat.appendChild(node);
                
            }
            
        })
        
    
    

    })
}

function validarChatPrivado(){
    chat.innerHTML = ""
    chats.forEach(element => {

        if(sessionStorage.getItem("user") == element.me && element.to == destinatario.innerHTML || sessionStorage.getItem("user") == element.to && element.me == destinatario.innerHTML)

        {
            if(element.me == sessionStorage.getItem("user") || element.to == sessionStorage.getItem("user"))
            {
                
                if(sessionStorage.getItem("user") == element.me)
                {
                    var node = document.createElement("li"); // Create a <li> node
                    node.setAttribute("class","clearfix");
                    node.innerHTML = `<div class="message-data align-right">
                    <span class="message-data-time" >10:10 AM, Today</span> &nbsp; &nbsp;
                    <i class="fa fa-circle me"></i>
                    </div>
                    <div class="message other-message float-right">
                    ${element.text}
                    </div>`;     
                       
                    chat.appendChild(node);
                }
                else
                {
                    var node = document.createElement("li");
                    node.innerHTML = `<div class="message-data">
                    <span class="message-data-time">10:12 AM, Today</span>
                    </div>
                    <div class="message my-message">${element.text}
                    </div>`
                    chat.appendChild(node);
                }
                
                
            }
        }
        
    })
}



