var utils = require('Utils');
var config = require('Config');

function Carrier(creep) {
    this.creep = creep;
    if(this.creep.memory.mode === undefined) {
        this.creep.memory.mode = 'load';
        this.creep.memory.tower = false;
    }
    // this.creep.memory.owner = undefined;
}

Carrier.prototype.act = function() {
    var self = this;
    if((self.creep.memory.owner === undefined || Game.creeps[self.creep.memory.owner] === undefined) && !self.creep.memory.tower) {
        self.creep.memory.owner = undefined;
        self.creep.memory.tower = false;
        Object.keys(Game.structures).map(function(st) { return Game.structures[st] }).filter(function(st) { return st.structureType === "tower" }).forEach(function(tower) {
            if(tower.energy < tower.energyCapacity * 0.9) {
                self.creep.memory.owner = tower.id;
                self.creep.memory.tower = true;
           } 
        });
    }
    
    if((self.creep.memory.owner === undefined || Game.creeps[self.creep.memory.owner] === undefined) && !self.creep.memory.tower) {
        self.creep.memory.owner = undefined;
        var builders = self.creep.room.creepsByRole('builder').filter(function(builder) { return builder.carry.energy < builder.carryCapacity / 2});
        if(builders.length > 0) {
            self.creep.memory.owner = builders[0].name;
        } 
    }

    if(self.creep.memory.owner !== undefined && Game.creeps[self.creep.memory.owner] !== undefined || self.creep.memory.tower) {
        if(self.creep.memory.mode === 'load') {
            var src = Game.spawns[self.creep.room.memory.spawn];
            if(self.creep.pos.isNearTo(src)) {
                self.creep.memory.path = undefined;
                if(self.creep.ticksToLive < config.renew_to_ttl && self.creep.memory.level >= self.creep.room.memory.level) {
                    src.renewCreep(self.creep);
                }
                if (src.energy > config.min_spawn_energy) {
                    self.creep.withdraw(src, RESOURCE_ENERGY);
                }
                self.creep.memory.mode = 'unload';
                self.creep.memory.owner = undefined;
                self.creep.memory.tower = false;
                self.creep.memory.path = undefined;
            } else {
                self.creep.goTo(src.pos);
            }
        } else if (self.creep.memory.mode === 'unload') {
            var trg;
            if(self.creep.memory.tower) {
                trg = Game.structures[self.creep.memory.owner];
            } else {
                trg = Game.creeps[self.creep.memory.owner];
            }
            self.creep.transferToNearby();

            if(self.creep.pos.isNearTo(trg)) {
                self.creep.memory.path = undefined;
                self.creep.transfer(trg, RESOURCE_ENERGY);
                self.creep.memory.owner = undefined;
                self.creep.memory.tower = false;
                self.creep.memory.mode = 'load';
                self.creep.memory.path = undefined;
            } else {
                self.creep.goTo(trg.pos);
            }
        }
    }
}

module.exports = Carrier;