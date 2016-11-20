var utils = require('Utils');
var config = require('Config');

function Carrier(creep) {
    this.creep = creep;
    if(this.creep.memory.mode === undefined) {
        this.creep.memory.mode = 'load';
    }
    // this.creep.memory.owner = undefined;
}

Carrier.prototype.act = ()=> {

    if(this.creep.memory.owner === undefined || Game.creeps[this.creep.memory.owner] === undefined) {
        this.creep.memory.owner = undefined;
        var miners = this.creep.room.creepsByRole('miner');
        var carriers = this.creep.room.creepsByRole('carrier');
        for(var i = 0; i < miners.length; i++) {
            if (!carriers.some(carrier => carrier.memory.owner === miners[i].name)) {
                this.creep.memory.supplying = false;
                this.creep.memory.owner = miners[i].name;
                break;
            }
        }
    }
    if(this.creep.memory.owner === undefined || Game.creeps[this.creep.memory.owner] === undefined) {
        var builders = this.creep.room.creepsByRole('builder');
        var carriers = this.creep.room.creepsByRole('carrier');
        for(var i = 0; i < builders.length; i++) {
            if (!carriers.some(carrier => carrier.memory.owner === builders[i].name)) {
                this.creep.memory.supplying = true;
                this.creep.memory.owner = builders[i].name;
                break;
            }
        }
    }


    if(this.creep.memory.owner !== undefined && Game.creeps[this.creep.memory.owner] !== undefined) {
        if(this.creep.memory.mode === 'load') {
            var src;
            if(this.creep.memory.supplying) {
                src = this.creep.room.getEnergySink(this.creep);
                if(this.creep.pos.isNearTo(src)) {
                    if ((this.creep.room.energyAvailable - src.energy) / this.creep.room.extensions().length > config.min_extension_energy && src.energy > config.min_spawn_energy) {
                        this.creep.withdraw(src, RESOURCE_ENERGY);
                    }
                    this.creep.memory.mode = 'unload';
                } else {
                    this.creep.goTo(src.pos);
                }
            } else {
                src = Game.creeps[this.creep.memory.owner];
                this.creep.withdrawFromNearby();
                if(this.creep.pos.isNearTo(src)) {
                    src.transfer(this.creep, RESOURCE_ENERGY);
                    if(this.creep.carry.energy >= this.creep.carryCapacity) {
                        this.creep.memory.mode = 'unload';
                    }
                } else {
                    this.creep.goTo(src.pos);
                }
            }

        } else if (this.creep.memory.mode === 'unload') {
            var trg;
            if(this.creep.memory.supplying) {
                trg = Game.creeps[this.creep.memory.owner];
                this.creep.transferToNearby();
            } else {
                trg = this.creep.room.getEnergySink(this.creep);
            }

            if(this.creep.pos.isNearTo(trg)) {
                this.creep.transfer(trg, RESOURCE_ENERGY);
                if(this.creep.carry.energy === 0) {
                    this.creep.memory.mode = 'load';
                }
            } else {
                this.creep.goTo(trg.pos);
            }
        }
    }
}

module.exports = Carrier;
