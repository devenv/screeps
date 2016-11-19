
var dirs = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];

Creep.prototype.act = function(actor) {
    if(this.ticksToLive < config.renew_ttl && this.memory.level >= this.room.memory.level) {
        this.memory.mode = 'renew';
    }
    actor.act();
}

Creep.prototype.goTo = function(pos) {
    this.memory.moved = true;
    if(!this.pos.isNearTo(pos)) {
        var res = this.moveTo(pos, {reusePath: true});
        // if(res === ERR_TIRED) {
        //     this.say('tired');
        // }
        if(res !== 0 && res !== ERR_TIRED) {
            res = this.moveTo(pos);
            if(res !== 0 && res !== ERR_TIRED) {
                this.say('stuck:' + res);
                // console.log(pos)
                if(Math.random() < 0.1) {
                    this.twitch();
                }
            }
            // } else {
            // Utils.twitch(creep);
        }
    }
}

Creep.prototype.twitch = function() {
    this.say('twitch');
    this.move(dirs[Math.floor(Math.random() * dirs.length)]);
}

Creep.prototype.withdrawFromNearby = function() {
    var containers = this.pos.findInRange(FIND_STRUCTURES, 1, {filter: { structureType: STRUCTURE_CONTAINER }});
    if(containers !== undefined && containers.length > 0) {
        this.withdraw(containers[0], RESOURCE_ENERGY);
    }
}

Creep.prototype.transferToNearby= function() {
    var containers = this.pos.findInRange(FIND_STRUCTURES, 1, {filter: { structureType: STRUCTURE_CONTAINER }});
    if(containers.length > 0) {
        this.transfer(containers[0], RESOURCE_ENERGY);
    }
}
