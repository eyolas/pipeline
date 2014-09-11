var mongoose = require('mongoose');


var cacheSchema = mongoose.Schema({
    key: { type: String, unique: true },
    data: String,
    headers: String
});


module.exports = cacheSchema;