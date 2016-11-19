var config = require('Config');

var dirs = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];

Creep.prototype.act = function(actor) {
  this.pickupEnergy();

  if(this.shouldRenew()) {
    this.memory.mode = 'renew';
  }

  if(this.memory.mode === 'renew') {
    this.renew();
  } else {
    actor.act();
  }
}

Creep.prototype.renew = function() {
  var spawn = this.room.spawn();
  if(this.pos.isNearTo(spawn)) {
    this.transfer(spawn, RESOURCE_ENERGY);
    spawn.renewCreep(this);
    this.transfer(spawn, RESOURCE_ENERGY);
    if(this.ticksToLive > config.renew_to_ttl || Math.random() < config.stop_renew_prob) {
      this.memory.mode = undefined;
    }
  } else {
    this.goTo(spawn.pos);
  }
}

Creep.prototype.pickupEnergy = function() {
  if(this.carryCapacity > 0 && this.carry.energy < this.carryCapacity) {
    var results = this.pos.lookFor(LOOK_RESOURCES);
    if (results.length > 0) {
      this.pickup(results[0]);
    }
  }
}

Creep.prototype.shouldRenew = function() {
  return this.ticksToLive < config.renew_ttl && this.memory.level >= this.room.memory.level;
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
