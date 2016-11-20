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
    if((this.creep.memory.owner === undefined || Game.creeps[this.creep.memory.owner] === undefined) && !this.creep.memory.tower) {
        this.creep.memory.owner = undefined;
        this.creep.memory.tower = false;
        Object.keys(Game.structures).map(st => Game.structures[st]).filter(st => st.structureType === "tower").forEach(tower => {
            if(tower.energy < tower.energyCapacity * 0.9) {
                this.creep.memory.owner = tower.id;
                this.creep.memory.tower = true;
           }
        });
    }

    if((this.creep.memory.owner === undefined || Game.creeps[this.creep.memory.owner] === undefined) && !this.creep.memory.tower) {
        this.creep.memory.owner = undefined;
        var builders = this.creep.room.creepsByRole('builder').filter(builder => builder.carry.energy < builder.carryCapacity / 2);
        if(builders.length > 0) {
            this.creep.memory.owner = builders[0].name;
        }
    }

    if(this.creep.memory.owner !== undefined && Game.creeps[this.creep.memory.owner] !== undefined || this.creep.memory.tower) {
        if(this.creep.memory.mode === 'load') {
            var src = Game.spawns[this.creep.room.memory.spawn];
            if(this.creep.pos.isNearTo(src)) {
                this.creep.memory.path = undefined;
                if(this.creep.ticksToLive < config.renew_to_ttl && this.creep.memory.level >= this.creep.room.memory.level) {
                    src.renewCreep(this.creep);
                }
                if (src.energy > config.min_spawn_energy) {
                    this.creep.withdraw(src, RESOURCE_ENERGY);
                }
                this.creep.memory.mode = 'unload';
                this.creep.memory.owner = undefined;
                this.creep.memory.tower = false;
                this.creep.memory.path = undefined;
            } else {
                this.creep.goTo(src.pos);
            }
        } else if (this.creep.memory.mode === 'unload') {
            var trg;
            if(this.creep.memory.tower) {
                trg = Game.structures[this.creep.memory.owner];
            } else {
                trg = Game.creeps[this.creep.memory.owner];
            }
            this.creep.transferToNearby();

            if(this.creep.pos.isNearTo(trg)) {
                this.creep.memory.path = undefined;
                this.creep.transfer(trg, RESOURCE_ENERGY);
                this.creep.memory.owner = undefined;
                this.creep.memory.tower = false;
                this.creep.memory.mode = 'load';
                this.creep.memory.path = undefined;
            } else {
                this.creep.goTo(trg.pos);
            }
        }
    }
}

module.exports = Carrier;
