var config = require('Config');

var Utils = {};

Utils.samePos = function(pos1, pos2) {
    return pos1 !== undefined && pos2 !== undefined && pos1.x === pos2.x && pos1.y === pos2.y;
};

Utils.countFreeSpots = function(pos) {
  var creep = this;
  var check = (dx, dy)=> Game.map.getTerrainAt(pos.x + dx, pos.y + dy, pos.roomName) !== 'wall';
  var count = 0;
  if(check(-1, -1)) { count++; }
  if(check(0, -1)) { count++; }
  if(check(1, -1)) { count++; }
  if(check(-1, 0)) { count++; }
  if(check(1, 0)) { count++; }
  if(check(-1, 1)) { count++; }
  if(check(0, 1)) { count++; }
  if(check(1, 1)) { count++; }
  return count;
}

Utils.sortByDistance = function(arr) { return arr.sort((a, b) => creep.pos.getRangeTo(a) > creep.pos.getRangeTo(b) ? 1 : -1) }

module.exports = Utils;
