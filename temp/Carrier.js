var utils = require('Utils');
var config = require('Config');

function Carrier(creep) {
    this.creep = creep;
    if(this.creep.memory.mode === undefined) {
        this.creep.memory.mode = 'load';
    }
    // this.creep.memory.owner = undefined;
}

Carrier.prototype.act = function() {
    var self = this;

    if(self.creep.memory.owner === undefined || Game.creeps[self.creep.memory.owner] === undefined) {
        self.creep.memory.owner = undefined;
        var miners = self.creep.room.creepsByRole('miner');
        var carriers = self.creep.room.creepsByRole('carrier');
        for(var i = 0; i < miners.length; i++) {
            if (!carriers.some(function(carrier) { return carrier.memory.owner === miners[i].name})) {
                self.creep.memory.supplying = false;
                self.creep.memory.owner = miners[i].name;
                break;
            }
        }
    }
    if(self.creep.memory.owner === undefined || Game.creeps[self.creep.memory.owner] === undefined) {
        var builders = self.creep.room.creepsByRole('builder');
        var carriers = self.creep.room.creepsByRole('carrier');
        for(var i = 0; i < builders.length; i++) {
            if (!carriers.some(function(carrier) { return carrier.memory.owner === builders[i].name})) {
                self.creep.memory.supplying = true;
                self.creep.memory.owner = builders[i].name;
                break;
            }
        }
    }


    if(self.creep.memory.owner !== undefined && Game.creeps[self.creep.memory.owner] !== undefined) {
        if(self.creep.memory.mode === 'load') {
            var src;
            if(self.creep.memory.supplying) {
                src = self.creep.room.getEnergySink(self.creep);
                if(self.creep.pos.isNearTo(src)) {
                    if ((self.creep.room.energyAvailable - src.energy) / self.creep.room.extensions().length > config.min_extension_energy && src.energy > config.min_spawn_energy) {
                        self.creep.withdraw(src, RESOURCE_ENERGY);
                    }
                    self.creep.memory.mode = 'unload';
                } else {
                    self.creep.goTo(src.pos);
                }
            } else {
                src = Game.creeps[self.creep.memory.owner];
                self.creep.withdrawFromNearby();
                if(self.creep.pos.isNearTo(src)) {
                    src.transfer(self.creep, RESOURCE_ENERGY);
                    if(self.creep.carry.energy >= self.creep.carryCapacity) {
                        self.creep.memory.mode = 'unload';
                    }
                } else {
                    self.creep.goTo(src.pos);
                }
            }

        } else if (self.creep.memory.mode === 'unload') {
            var trg;
            if(self.creep.memory.supplying) {
                trg = Game.creeps[self.creep.memory.owner];
                self.creep.transferToNearby();
            } else {
                trg = self.creep.room.getEnergySink(self.creep);
            }

            if(self.creep.pos.isNearTo(trg)) {
                self.creep.transfer(trg, RESOURCE_ENERGY);
                if(self.creep.carry.energy === 0) {
                    self.creep.memory.mode = 'load';
                }
            } else {
                self.creep.goTo(trg.pos);
            }
        }
    }
}

module.exports = Carrier;
