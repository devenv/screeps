var utils = require('Utils');
var config = require('Config');

function Healer(creep) {
    this.creep = creep;
    if(this.creep.memory.mode === undefined) {
        this.creep.memory.mode = 'guard';
    }
}

Healer.prototype.act = function() {
    var self = this;
        var flagged = false;
    var hasTarget = false;
    Object.keys(Game.flags).map(function(name) { return Game.flags[name] }).forEach(function(flag) {
        if(flag.name === 'target room') {
            hasTarget = true;
            if(self.creep.pos.roomName != flag.pos.roomName) {
                var exitDir = self.creep.room.findExitTo(flag.pos.roomName);
                var exit = self.creep.pos.findClosestByRange(exitDir);
                self.creep.goTo(exit);
                flagged = true;
            }
        }
    });
    if(flagged) {
        console.log(self.creep)
        return;
    }
    if(self.creep.ticksToLive < config.renew_ttl && self.creep.memory.level >= self.creep.room.memory.level) {
        if(!hasTarget) {
            self.creep.memory.mode = 'renew';
            self.creep.say('renew');
        }
    }
    if(self.creep.memory.mode === 'guard') {
        if(self.healFriendly()) { return; }
        var target;
        var flags = Object.keys(Game.flags).map(function(name) { return Game.flags[name] }).filter(function(flag) { return flag.pos.roomName === self.creep.room.name && flag.name === 'guard'});
        if(flags.length > 0) {
            target = flags[0].pos;
        } else {
            target = self.creep.room.getPositionAt(25, 25);
        }
        if(this.creep.pos.getRangeTo(target) > 1) {
            self.creep.goTo(target);
        }

    } else if(self.creep.memory.mode === 'renew') {
        var spawn = Game.spawns[self.creep.room.memory.spawn];
        if(self.creep.pos.isNearTo(spawn)) {
            spawn.renewCreep(self.creep);
            if(self.creep.ticksToLive > config.renew_to_ttl || Math.random() < config.stop_renew_prob) {
                self.creep.withdraw(spawn, RESOURCE_ENERGY);
                self.creep.memory.mode = 'guard';
            }
        } else {
            self.creep.goTo(spawn.pos);
        }
    }
}

Healer.prototype.healFriendly = function() {
    var wounded = Object.keys(Game.creeps).map(function(name) { return Game.creeps[name] }).filter(function(creep) { return creep.hits < creep.hitsMax });
    if(wounded.length) {
        this.creep.moveTo(wounded[0]);
        this.creep.heal(wounded[0]);
        if(Math.random() > 0.9) {
            this.creep.say('+++');
        }
        return true;
    }
    return false;
}

module.exports = Healer;