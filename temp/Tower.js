var config = require('Config');

var Tower = function(tower) {
    this.tower = tower;
};

Tower.prototype.act = function() {
    var self = this;
    var targets = self.tower.room.findHostiles();
    if(targets.length > 0) {
        self.tower.attack(targets[0]);
    } else {
        var wounded = Object.keys(Game.creeps).map(function(name) { return Game.creeps[name] }).filter(function(creep) { return creep.room.name === self.tower.name && creep.hits < creep.hitsMax });
        if(wounded.length > 0) {
            self.tower.heal(wounded[0]);
        } else {
            var broken = Object.keys(Game.structures).map(function(name) { return Game.structures[name] }).filter(function(st) { return st.room.name === self.tower.name && st.hits < st.hitsMax });
            if(broken.length > 0) {
                self.tower.repair(broken[0]);
            } else if(self.tower.energy > self.tower.energyCapacity / 4) {
                var to_repair = self.tower.room.brokenStructures();
                if(to_repair.length > 0) {
                    self.tower.repair(to_repair[0]);
                }
            }
        }
    }
};

module.exports = Tower;