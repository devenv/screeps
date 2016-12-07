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
      var broken = Object.keys(Game.structures).map(name => Game.structures[name]).filter(st => st.room.name === this.tower.name && st.hits < st.hitsMax);
      if(broken.length > 0) {
        this.tower.repair(broken[0]);
      } else if(this.tower.energy > this.tower.energyCapacity * 0.75) {
        var to_repair = this.tower.room.brokenStructures();
        if(to_repair.length > 0) {
          this.tower.repair(to_repair[0]);
        }
      }
    }
  }
};

module.exports = Tower;
