var utils = require('Utils');
var config = require('Config');

function Scout(creep) {
  this.creep = creep;
  if(this.creep.memory.mode === undefined) {
    this.creep.memory.mode = 'scout';
  }
}

Scout.prototype.act = function() {
  if(this.creep.memory.target === undefined) {
    _.values(Game.flags).some(flag => {
      if(flag.name.indexOf('scout') !== -1 && !_.values(Game.creeps).some(creep => creep.memory.role === 'scout' && utils.samePos(creep.memory.target, flag.pos))) {
        this.creep.memory.target = flag.pos;
        return true;
      }
    });
  }
  if(this.creep.memory.target !== undefined) {
    if(this.creep.room.name !== this.creep.memory.target.roomName) {
      var exitDir = this.creep.room.findExitTo(this.creep.memory.target.roomName);
      var exit = this.creep.pos.findClosestByPath(exitDir);
      this.creep.moveTo(exit);
    } else {
      if(!this.creep.pos.isNearTo(this.creep.memory.target)) {
        this.creep.moveTo(this.creep.memory.target.x, this.creep.memory.target.y);
      }
    }
  } else {
    this.creep.memory.sleep = config.scout_sleep;
  }
}

module.exports = Scout;
