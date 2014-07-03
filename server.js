// Setup basic express server
var express = require('express');
var app =  express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var redis = require('redis').createClient();


io.on('connection', function(socket){

    //Init
    console.log('Conexión detectada');
    redis.lrange('SONGS', 0, -1, function(err, records){
        if(!err){
            records.forEach(function(record){
                record = JSON.parse(record);
                socket.emit('message', record);
            });
        }
    });

    //Get a song message
    socket.on('message', function(twitter, song){

        record = { twitter: twitter, song: song };
        console.log("[@%s] %s", twitter, song);

        redis.lpush('SONGS', JSON.stringify(record));
        io.emit('message', record);

    });

    //Disconect
    socket.on('disconnect', function(){
        console.log('Desconexión detectada');
    });
});

// Routing
app.use(express.static(__dirname + '/public'));
app.use('/api', require('./api')(express, redis));

server.listen(3001, "127.0.0.1", function(){
    console.log('Server listen on port http://127.0.0.1:3001');
})
