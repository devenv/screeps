var utils = require('Utils');
var config = require('Config');

function Soldier(creep) {
    this.creep = creep;
    if(this.creep.memory.mode === undefined) {
        this.creep.memory.mode = 'guard';
    }
    if(this.creep.memory.origin_room === undefined) {
        this.creep.memory.origin_room = this.creep.room.name;
    }
}

Soldier.prototype.act = function() {
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
        return;
    }
    if(self.creep.memory.mode === 'guard') {

        if(self.attackSpawns()) { return; }
        if(self.attackHostiles()) { return; }

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
        return;
    }
}

Soldier.prototype.attackHostiles = function() {
    var target = this.creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if(target !== null) {
        this.creep.memory.moved = true;
        this.creep.moveTo(target);
        this.creep.attack(target);
        if(Math.random() > 0.9) {
            this.creep.say('die', true);
        }
        return true;
    }
    return false;
}

Soldier.prototype.attackSpawns = function() {
    var targets = Game.rooms[this.creep.pos.roomName].findHostileSpawn();
    if(targets !== undefined && targets.length > 0) {
        this.creep.memory.moved = true;
        this.creep.moveTo(targets[0]);
        this.creep.attack(targets[0]);
        if(Math.random() > 0.9) {
            this.creep.say('destroy', true);
        }
        return true;
    }
    return false;
}

module.exports = Soldier;
