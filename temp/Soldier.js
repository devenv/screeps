var utils = require('Utils');
var config = require('Config');

function Soldier(creep) {
  this.creep = creep;
  if(this.creep.memory.mode === undefined) {
    this.creep.memory.mode = 'guard';
  }
}

Soldier.prototype.act = function() {
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

    if(this.attackSpawns()) { return; }
    if(this.attackHostiles()) { return; }

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
      return;
    }
  }
}

Soldier.prototype.attackHostiles = function() {
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

Soldier.prototype.attackSpawns = function() {
  var targets = Game.rooms[this.creep.pos.roomName].findHostileSpawn();
  if(targets !== undefined && targets.length > 0) {
    this.creep.memory.moved = true;
    this.creep.moveTo(targets[0]);
    this.creep.attack(targets[0]);
    if(Math.random() > 0.9) {
      this.creep.say('destroy', true);
    }
    return true;
  }
  return false;
}

module.exports = Soldier;
