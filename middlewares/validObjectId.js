const mongoose = require('mongoose');

const validObjectId = function(fieldName){
    return function (req, res, next){
        if(!mongoose.isValidObjectId(req.params[fieldName]) || req.params[fieldName].trim().length==0){
            res.status(400).send('Invalid Object Id');
        }
        else{
            next();
        }
    }
}

module.exports = validObjectId;