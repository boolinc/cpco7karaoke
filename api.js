module.exports = function(express, redis, io){


    var router = express.Router();

    router.use('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });

    // get /api/songs --> [{"twitter": "pandres95", "song": "Green Day(...)"},...]
    router.get('/songs', function(req, res){
        var responseObj = [];
        redis.lrange('SONGS', 0, -1, function(err, records){
            if(!err){
                for(id in records){
                    var record = JSON.parse(records[id]);
                    record['id'] = id;
                    console.log(record);
                    responseObj.push(record);
                }
                res.status(200).json({success: true, data: responseObj});
            }
        });
    });

    router.post('/songs/:id', function(req, res){
        console.log(req.params);
        io.emit('active', {id: req.params.id});
        res.status(200).json({success:true})
    });

    return router;

}
