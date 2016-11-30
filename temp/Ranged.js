var utils = require('Utils');
var config = require('Config');

function Ranged(creep) {
  this.creep = creep;
  if(this.creep.memory.mode === undefined) {
    this.creep.memory.mode = 'guard';
  }
}

Ranged.prototype.act = function() {
  _.values(Game.flags).forEach(flag => {
    if(flag.name === 'target room') {
      if(this.creep.pos.roomName != flag.pos.roomName) {
        var exitDir = this.creep.room.findExitTo(flag.pos.roomName);
        var exit = this.creep.pos.findClosestByRange(exitDir);
        this.creep.moveTo(exit);
        return
      }
    }
  });
  if(this.creep.memory.mode === 'guard') {
    if(!Game.rooms[this.creep.pos.roomName].controller.my) {
      this.creep.moveTo(Game.rooms[this.creep.memory.origin_room].controller);
    } else {
      var target;
      var flags = Object.keys(Game.flags).map(name => Game.flags[name]).filter(flag => flag.pos.roomName === this.creep.room.name && _.startsWith(flag.name, 'guard'));
      if(flags.length > 0) {
        target = flags[0].pos;
      } else {
        target = this.creep.room.getPositionAt(25, 25);
      }
      if(this.creep.pos.getRangeTo(target) > 1) {
        this.creep.moveTo(target);
      }

    }
  }
}

module.exports = Ranged;
