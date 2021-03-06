// Setup basic express server
var express = require('express');
var app =  express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var redis = require('redis').createClient();

var table = "SONGS";


function init(redis, socket){

    //Init
    console.log('Conexión detectada');

    var responseObj = [];
    redis.lrange(table, 0, -1, function(err, records){
        if(!err){
            for(id in records){
                var record = JSON.parse(records[id]);
                record['id'] = id;
                responseObj.push(record);
            }
            console.log(responseObj);
            socket.emit('init', responseObj);
        }
    });
}


io.on('connection', function(socket){

    init(redis, socket);

    // Social events
    socket.on('like', function(id){
        redis.lrange(table, id, id, function(err, songs){

            console.log(id, songs);
            record = JSON.parse(songs[0]);

            record.likes += 1;
            redis.lset(table, id, JSON.stringify(record));

            record['id'] = id;
            io.emit('update', record);
        });
    });

    socket.on('unlike', function(id){
        redis.lrange(table, id, id, function(err, songs){

            record = JSON.parse(songs[0]);
            record.likes -= 1;
            redis.lset(table, id, JSON.stringify(record));

            record['id'] = id;
            io.emit('update', record);
        });
    });

    socket.on('dislike', function(id){
        redis.lrange(table, id, id, function(err, songs){

            record = JSON.parse(songs[0]);
            record.dislikes += 1;
            redis.lset(table, id, JSON.stringify(record));

            record['id'] = id;
            io.emit('update', record);
        });
    });

    socket.on('undislike', function(id){
        redis.lrange(table, id, id, function(err, songs){

            record = JSON.parse(songs[0]);
            record.dislikes -= 1;
            redis.lset(table, id, JSON.stringify(record));

            record['id'] = id;
            io.emit('update', record);
        });
    });

    //Get a song message
    socket.on('message', function(twitter, song){

        record = {
            twitter: twitter,
            song: song,
            likes: 0,
            dislikes: 0,
            date: new Date(),
            toString: function(){
                return require('util').format("[%s] @%s: %s (%d/%d)",
                this.date, this.twitter, this.song, this.likes, this.dislikes);
            }
        };

        console.log(record.toString());

        var res = redis.rpush(table, JSON.stringify(record), function(err, id){
            if (!err){
                record['id'] = id - 1;
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

server.listen(3001, "127.0.0.1", function(){
    console.log('Server listen on port http://127.0.0.1:3001');
})
