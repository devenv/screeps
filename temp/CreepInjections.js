var config = require('Config');

var dirs = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
var energySinks = [STRUCTURE_CONTAINER, STRUCTURE_TOWER, STRUCTURE_SPAWN, STRUCTURE_EXTENSION]

Creep.prototype.act = function(actor) {
  if(this.memory.origin_room === undefined) {
    this.memory.origin_room = this.room.name;
  }

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
  var spawn = this.originRoom().spawn();
  if(this.pos.isNearTo(spawn)) {
    this.transfer(spawn, RESOURCE_ENERGY);
    if(this.ticksToLive > config.critical_ttl && (!this.originRoom().hasSpareEnergy() || this.ticksToLive > config.renew_to_ttl || Math.random() < config.stop_renew_prob)) {
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

Creep.prototype.shouldRenew = function() { return !this.body.some(part => part.type === CLAIM) && (this.originRoom().hasSpareEnergy() || this.ticksToLive < config.critical_ttl) && this.ticksToLive < config.renew_ttl && this.memory.level >= this.originRoom().level() };

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

Creep.prototype.originRoom = function() {
  return Game.rooms[this.memory.origin_room];
}

Creep.prototype.withdrawFromNearby = function() {
  var containers = this.pos.findInRange(FIND_STRUCTURES, 1, {filter: {structureType: STRUCTURE_CONTAINER}})
  .sort((a, b) => a.energy > b.energy ? -1 : 1);
  if(containers !== undefined && containers.length > 0) {
    this.withdraw(containers[0], RESOURCE_ENERGY);
  }
}

Creep.prototype.transferToNearby= function() {
  var containers = this.pos.findInRange(FIND_STRUCTURES, 1)
  .filter(st => _.contains(energySinks, st.structureType))
  .sort((a, b) => a.energy > b.energy ? 1 : -1);
  if(containers.length > 0) {
    this.transfer(containers[0], RESOURCE_ENERGY);
  }
}
