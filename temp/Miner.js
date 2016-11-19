var utils = require('Utils');
var config = require('Config');

function Miner(creep) {
    this.creep = creep;
    // this.creep.memory.source = undefined;
}

Miner.prototype.act = function() {
    var self = this;

    var flags = self.creep.room.find(FIND_FLAGS, {filter: {name: 'd'}});
    if(flags.length > 0) {
        var flag = flags[0];
        var miner = self.creep.room.creepsByRole('miner')[0];
        if(self.creep.name === miner.name) {
            miner.say('x_x');
            if(miner.carry.energy === miner.carryCapacity) {
                var trg = miner.room.getEnergySink();
                miner.moveTo(trg);
                miner.transfer(trg, RESOURCE_ENERGY);
            } else {
                var src = self.creep.room.lookForAt(LOOK_STRUCTURES, flag.pos)[0];
                if(src !== undefined) {
                    miner.moveTo(src.pos);
                    miner.dismantle(src);
                }
            }
            return;
        }
    }

    if(self.creep.memory.mode === undefined) {
        self.creep.memory.mode = 'mining';
    }
    if(self.creep.memory.mode === 'mining') {
        if(self.creep.memory.source === undefined) {
            var sources = self.creep.room.find(FIND_SOURCES);
            var keys = Object.keys(sources);
            for(var i = 0; i < keys.length; i++) {
                var source = sources[keys[i]];
                var creeps_working = Object.keys(Game.creeps).filter(function(creep) { return Game.creeps[creep].memory.source !== undefined && Game.creeps[creep].memory.source.x === source.pos.x && Game.creeps[creep].memory.source.y === source.pos.y; }).length;
                var empty_spots = self.creep.room.countFreeSpots(source.pos);
                if (creeps_working < empty_spots) {
                    this.creep.memory.source = source.pos;
                    break;
                }
            }
        }
        if(self.creep.memory.source !== undefined) {
            var source = self.creep.room.getPositionAt(self.creep.memory.source.x, self.creep.memory.source.y);
            if(self.creep.pos.isNearTo(source)) {
                self.creep.harvest(self.creep.room.lookForAt(LOOK_SOURCES, source)[0]);
                self.creep.transferToNearby();
                var hasCarrier = self.creep.room.creepsByRole('carrier').filter(function(creep) { return creep !== undefined && creep.memory.owner === self.creep.name}).length > 0;
                if(self.creep.carry.energy >= self.creep.carryCapacity && !hasCarrier) {
                    self.creep.say('unload');
                    self.creep.memory.mode = 'unload';
                }
            } else {
                self.creep.goTo(source);
            }
        }
    } else if (self.creep.memory.mode === 'unload') {
        var spawn = self.creep.room.getEnergySink();
        if(self.creep.pos.isNearTo(spawn)) {
            self.creep.transfer(spawn, RESOURCE_ENERGY);
            self.creep.memory.mode = 'mining';
        } else {
            self.creep.goTo(spawn.pos);
        }
    }
}

module.exports = Miner;
