var utils = require('Utils');
var config = require('Config');

function Healer(creep) {
  this.creep = creep;
  if(this.creep.memory.mode === undefined) {
    this.creep.memory.mode = 'guard';
  }
}

Healer.prototype.act = function() {
  Object.keys(Game.flags).map(name => Game.flags[name]).forEach(flag => {
    if(flag.name === 'target room') {
      if(this.creep.pos.roomName != flag.pos.roomName) {
        var exitDir = this.creep.room.findExitTo(flag.pos.roomName);
        var exit = this.creep.pos.findClosestByRange(exitDir);
        this.creep.moveTo(exit);
        this.creep.memory.mode === 'attack';
        return
      }
    }
  });
  if(this.creep.memory.mode === 'guard') {
    var target;
    var flags = Object.keys(Game.flags).map(name => Game.flags[name]).filter(flag => flag.pos.roomName === this.creep.room.name && _.startsWith(flag.name, 'guard'));
    if(flags.length > 0) {
      target = flags[0].pos;
    } else {
      target = this.creep.room.getPositionAt(25, 25);
    }
    if(this.creep.pos.getRangeTo(target) > 1) {
      this.creep.moveTo(target);
    } else {
      this.creep.memory.sleep = config.healer_sleep;
    }
  }
}

module.exports = Healer;
