var config = require('Config');

function Tower(tower) {
  this.tower = tower;
};

Tower.prototype.act = function() {
  var targets = this.tower.room.hostileCreeps;
  if(targets.length > 0) {
    this.tower.attack(targets[0]);
  } else {
    var wounded = Object.keys(Game.creeps).map(name => Game.creeps[name]).filter(creep => creep.my && creep.room.name === this.tower.name && creep.hits < creep.hitsMax);
    if(wounded.length > 0) {
      this.tower.heal(wounded[0]);
    } else {
      var broken = this.tower.room.broken_structures();
      if(broken.length > 0 && this.tower.energy > this.tower.energyCapacity * 0.75) {
        this.tower.repair(broken[0]);
      }
    }
  }
};

module.exports = Tower;
