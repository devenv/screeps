var utils = require('Utils');
var config = require('Config');

function Healer(creep) {
    this.creep = creep;
    if(this.creep.memory.mode === undefined) {
        this.creep.memory.mode = 'guard';
    }
}

Healer.prototype.act = ()=> {
    var flagged = false;
    var hasTarget = false;
    Object.keys(Game.flags).map(name => Game.flags[name]).forEach(flag => {
        if(flag.name === 'target room') {
            hasTarget = true;
            if(this.creep.pos.roomName != flag.pos.roomName) {
                var exitDir = this.creep.room.findExitTo(flag.pos.roomName);
                var exit = this.creep.pos.findClosestByRange(exitDir);
                this.creep.moveTo(exit);
                flagged = true;
            }
        }
    });
    if(flagged) {
        console.log(this.creep)
        return;
    }
    if(this.creep.memory.mode === 'guard') {
        if(this.healFriendly()) { return; }
        var target;
        var flags = Object.keys(Game.flags).map(name => Game.flags[name]).filter(flag => flag.pos.roomName === this.creep.room.name && flag.name === 'guard');
        if(flags.length > 0) {
            target = flags[0].pos;
        } else {
            target = this.creep.room.getPositionAt(25, 25);
        }
        if(this.creep.pos.getRangeTo(target) > 1) {
            this.creep.moveTo(target);
        }

    }
}

Healer.prototype.healFriendly = ()=> {
    var wounded = Object.keys(Game.creeps).map(name => Game.creeps[name]).filter(creep => creep.hits < creep.hitsMax);
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
