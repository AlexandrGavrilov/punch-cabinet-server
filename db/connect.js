const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let dbConnection;

module.exports = {
    connectToServer: function (callback) {
        try {
            client.connect(function (err, db) {
                if (err || !db) {
                    return callback(err);
                }

                dbConnection = db.db("punchCabinet");
                console.log("Successfully connected to MongoDB.");

                return callback();
            });
        } catch (e) {
            console.log(e)
        }
    },

    getDb: function () {
        return dbConnection;
    },
};