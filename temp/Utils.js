var config = require('Config');

var Utils = {};

Utils.samePos = function(pos1, pos2) {
    return pos1 !== undefined && pos2 !== undefined && pos1.x === pos2.x && pos1.y === pos2.y;
};



module.exports = Utils;