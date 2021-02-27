const express = require('express')
const session = require ( 'express-session' )
const app = express()

app.use(session({
    secret: "123gfdkgdsgfgd",
    resave: false,
    saveUninitialized: false
}))
app.set('port',process.env.PORT || 3000)

app.get('/', function(req, res) {
    res.send('hello world');
  });

const server = app.listen(app.get('port'),() => {

    console.log("inicio servidor ")
})

const soketio = require('socket.io')
const io = soketio(server)


var usuarios=[]

io.on('connection', (socket) => {
   
    console.log(usuarios.length)//cantidad de conectados

    io.emit('activos',usuarios)//enviando usuarios al cliente

    //ACTUALIZA ID DEL SOCKET A EL MISMO USUARIO CONECTADO (solucion al refresh)
    socket.on('newIdSocket', function (data) 
    {
        usuarios.forEach(x =>
        {
           
            if(x.name == data.name)
            {
                x.idSocket = socket.id;
            }
          
        });
        
        
        io.emit('activos',usuarios)
        
    });

    // ESCUCHANDO NUEVOS USUARIOS
    socket.on('newIdUser', function (data) 
    {
        var user = {
            name: data.name,
            idSocket: socket.id,
            notificacion: 0
        }
        
        usuarios.push(user);
        
        console.log('----------------')
        io.emit('activos',usuarios)
        
    });

   
    // ESCUCHANDO MENSAJES NUEVOS Y ENVIANDO A LOS CLIENTES RESPECTIVOS Y/O GRUPOS
    socket.on('message' , (data) => 
    {
        console.log(data)

        //grupal
        if(data.to == "" )
        {
            io.emit('grupal',data)// enviando mensaje al grupo
        }
        else
        { 
            //personal
             usuarios.forEach(x =>
            {
                if(x.name==data.me)
                {
                    io.to(x.idSocket).emit("individual",data)//mostrar mensaje al emisor
                }
            });

            const user = usuarios.find( user => user.name === data.to);
            io.to(user.idSocket).emit("individual",data)//mostrar mensaje al receptor
      
        }
        
    })

    // ESCUCHANDO DESCONECCIONES
    socket.on('deleteUser', (data) =>{
        console.log("un usuario desconectado :" + data.name)
        const user = usuarios.find( u => u.name === data.name);
        usuarios.splice(usuarios.indexOf(user),1)
        io.emit('activos',usuarios)
        usuarios.forEach(element => console.log(element))
    });
       
      
   //IMPRIMIENDO EN CONSOLA TODOS LOS USUARIOS CONECTADOS
    usuarios.forEach(element => console.log(element))
})