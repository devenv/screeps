var utils = require('Utils');
var config = require('Config');

var Ranged = (creep)=> {
  this.creep = creep;
  if(this.creep.memory.mode === undefined) {
    this.creep.memory.mode = 'guard';
  }
}

Ranged.prototype.act = ()=> {
  var flagged = false;
  var hasTarget = false;
  _.values(Game.flags).forEach(flag => {
    if(flag.name === 'target room') {
      hasTarget = true;
      if(this.creep.pos.roomName != flag.pos.roomName) {
        var exitDir = this.creep.room.findExitTo(flag.pos.roomName);
        var exit = this.creep.pos.findClosestByRange(exitDir);
        this.creep.moveTo(exit);
        flagged = true;
      }
    }
  });
  if(flagged) {
    return;
  }
  if(this.creep.memory.mode === 'guard') {
    if(this.attackHostiles()) { return; }
    if(this.attackSpawns()) { return; }

    if(!Game.rooms[this.creep.pos.roomName].controller.my) {
      this.creep.moveTo(Game.rooms[this.creep.memory.origin_room].controller);
    } else {
      var target;
      var flags = Object.keys(Game.flags).map(name => Game.flags[name]).filter(flag => flag.pos.roomName === this.creep.room.name && flag.name === 'guard');
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

Ranged.prototype.attackHostiles = ()=> {
  var target = this.creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
  if(target !== null) {
    this.creep.memory.moved = true;
    this.creep.moveTo(target);
    this.creep.rangedAttack(target);
    if(Math.random() > 0.9) {
      this.creep.say('die', true);
    }
    return true;
  }
  return false;
}

Ranged.prototype.attackSpawns = ()=> {
  var targets = this.creep.room.findHostileSpawn();
  if(targets !== undefined && targets.length > 0) {
    this.creep.moveTo(targets[0]);

    if(Math.random() > 0.9) {
      this.creep.say('exterminate', true);
    }

    var rangedTargets = this.creep.pos.findInRange(FIND_HOSTILE_SPAWNS, 3);
    if(rangedTargets.length > 0) {
      this.creep.rangedAttack(rangedTargets[0]);
      return true;
    }
  }
  return false;
}

module.exports = Ranged;
