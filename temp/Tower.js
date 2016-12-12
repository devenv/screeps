var config = require('Config');

function Tower(tower) {
  this.tower = tower;
  this.room = tower.room;
};

Tower.prototype.act = function() {
  var targets = this.tower.room.hostileCreeps;
  if(targets.length > 0) {
    var target = this.room.find(FIND_HOSTILE_CREEPS, {filter: t => t.name !== 'Source Keeper'})[0];
    this.tower.attack(target);
  } else {
    var wounded = Object.keys(Game.creeps).map(name => Game.creeps[name]).filter(creep => creep.my && creep.room.name === this.tower.name && creep.hits < creep.hitsMax);
    if(wounded.length > 0) {
      this.tower.heal(wounded[0]);
    } else {
      var broken = this.tower.room.broken_structures();
      if(broken.length > 0 && (broken[0].hits < broken[0].hitsMax / 4 || this.tower.energy > this.tower.energyCapacity * 0.75)) {
        this.tower.repair(broken[0]);
      }
    }
  }
};

module.exports = Tower;
