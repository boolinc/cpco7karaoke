module.exports = function(express){


    var router = express.Router();

    // get /api/songs --> [{"twitter": "pandres95", "song": "Green Day(...)"},...]
    router.get('/songs', function(req, res){
        var responseObj = [];
        redis.lrange('SONGS', 0, -1, function(err, records){
            if(!err){
                for(record in records){
                    record = records[record];
                    responseObj.append(JSON.parse(record));
                }
                res.status(200).json(responseObj);
            }
        });
    });

    return router;

}
