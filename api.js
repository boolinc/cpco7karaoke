module.exports = function(express, redis){


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
                for(record in records){
                    record = records[record];
                    responseObj.push(JSON.parse(record));
                }
                res.status(200).json(responseObj);
            }
        });
    });
    router.post('/songs/:id', function(req, res){
        
    });

    return router;

}
