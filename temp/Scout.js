var utils = require('Utils');

function Scout(creep) {
  this.creep = creep;
  if(this.creep.memory.mode === undefined) {
    this.creep.memory.mode = 'scout';
  }
}

Scout.prototype.act = function() {
  if(this.attackHostiles()) { return; }
  if(this.creep.memory.target === undefined) {
    _.values(Game.flags).some(flag => {
      if(flag.name === 'scout' && !_.values(Game.creeps).some(creep => creep.memory.role === 'scout' && utils.samePos(creep.memory.target, flag.target))) {
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
  }
}

Scout.prototype.attackHostiles = function() {
  var target = this.creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
  if(target !== null) {
    this.creep.memory.moved = true;
    this.creep.moveTo(target);
    this.creep.attack(target);
    if(Math.random() > 0.9) {
      this.creep.say('die', true);
    }
    return true;
  }
  return false;
}

module.exports = Scout;
