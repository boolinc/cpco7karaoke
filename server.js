// Setup basic express server
var express = require('express');
var app =  express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var redis = require('redis').createClient();

function update(redis, socket){
    //Init
    console.log('Conexión detectada');
    redis.lrange('SONGS', 0, -1, function(err, records){
        if(!err){
            records.forEach(function(record, i){
                record = JSON.parse(record);
                record['id'] = i;
                console.log(record);
                socket.emit('message', record);
            });
        }
    });
}


io.on('connection', function(socket){

    update(redis, socket);

    // Social events
    socket.on('like', function(id){
        console.log(id);
        redis.lrange('SONGS', id, id, function(err, songs){

            console.log("Songs: %j", songs);

            record = JSON.parse(songs[0]);
            console.log(record);
            record.likes += 1;
            redis.lset('SONGS', id, JSON.stringify(record));

            record['id'] = id;
            io.emit('update', record);
        });
    });

    socket.on('unlike', function(id){
        redis.lrange('SONGS', id, id, function(err, songs){

            record = JSON.parse(songs[0]);
            console.log(record);
            record.likes -= 1;
            redis.lset('SONGS', id, JSON.stringify(record));

            record['id'] = id;
            io.emit('update', record);
        });
    });

    socket.on('dislike', function(id){
        redis.lrange('SONGS', id, id, function(err, songs){

            record = JSON.parse(songs[0]);
            console.log(record);
            record.dislikes += 1;
            redis.lset('SONGS', id, JSON.stringify(record));

            record['id'] = id;
            io.emit('update', record);
        });
    });

    socket.on('undislike', function(id){
        redis.lrange('SONGS', id, id, function(err, songs){

            record = JSON.parse(songs[0]);
            console.log(record);
            record.dislikes -= 1;
            redis.lset('SONGS', id, JSON.stringify(record));

            record['id'] = id;
            io.emit('update', record);
        });
    });

    //Get a song message
    socket.on('message', function(twitter, song){

        record = { twitter: twitter, song: song, likes: 0, dislikes: 0 };
        console.log("[@%s] %s", twitter, song);

        var res = redis.lpush('SONGS', JSON.stringify(record), function(err, id){
            if (!err){
                record['id'] = id;
                io.emit('message', record);
            }
        });

    });

    //Disconect
    socket.on('disconnect', function(){
        console.log('Desconexión detectada');
    });

});

// Routing
app.use(express.static(__dirname + '/public'));
app.use('/api', require('./api')(express, redis, io));

server.listen(3001, "127.0.0.1", function(){
    console.log('Server listen on port http://127.0.0.1:3001');
})
