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

  if(this.body.some(part => part.type === ATTACK || part.type === RANGED_ATTACK)) {
    if(this.attackSpawns()) { return; }
    if(this.attackHostiles()) { return; }
  }
  if(this.body.some(part => part.type === HEAL)) {
    if(this.healFriendly()) { return; }
  }

  if(this.memory.mode === 'renew') {
    this.renew();
    return;
  }
  actor.act();
  if(this.carry.energy > 0) {
    if(_.include(['unload', 'mining'], this.memory.mode && this.memory.role !== 'carrier')) {
      var trg = this.pos.findInRange(FIND_MY_CREEPS, 1).filter(cr => _.include(['load', 'build'], cr.memory.mode) && cr.carry.energy < cr.carryCapacity);
      if(trg.length > 0) {
        this.transfer(trg[0], RESOURCE_ENERGY);
        return
      }
    }
  }
}

Creep.prototype.renew = function() {
  var spawn = this.originRoom().spawn();
  if(this.pos.isNearTo(spawn)) {
    this.transfer(spawn, RESOURCE_ENERGY);
    if(!this.originRoom().hasSpareEnergy() || this.ticksToLive > config.renew_to_ttl || Math.random() < config.stop_renew_prob) {
      this.memory.mode = undefined;
    }
  } else {
    this.goTo(spawn.pos);
  }
}

Creep.prototype.pickupEnergy = function() {
  if(this.carryCapacity > 0 && this.carry.energy < this.carryCapacity) {
    var results = this.pos.lookFor(LOOK_ENERGY).filter(res => res.resourceType === RESOURCE_OXYGEN);
    if (results.length > 0) {
      this.pickup(results[0]);
    }
  }
}

Creep.prototype.shouldRenew = function() { return !this.body.some(part => part.type === CLAIM) && this.originRoom().hasSpareEnergy() && this.ticksToLive < config.renew_ttl && this.memory.level >= this.originRoom().level() };

Creep.prototype.goTo = function(pos) {
  this.memory.moved = true;
  var res = this.moveTo(pos, {reusePath: config.reuse_path_ticks, maxOps: config.path_max_ops});
  // if(res === ERR_TIRED) {
  //     this.say('tired');
  // }
  if(res !== 0 && res !== ERR_TIRED) {
    res = this.moveTo(pos);
    if(res !== 0 && res !== ERR_TIRED) {
      this.say('stuck:' + res);
      if(Math.random() < 0.1) {
        this.twitch();
      }
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
    return;
  }
}

Creep.prototype.attackHostiles = function() {
  var target = this.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
  if(target !== null) {
    this.memory.moved = true;
    this.moveTo(target);
    this.attack(target);
    if(Math.random() > 0.9) {
      this.say('die', true);
    }
    Game.notify("Hostiles", 1);
    Memory.stats[this.room.name + '.creeps.hostiles'] = 1;
    return true;
  }
  Memory.stats[this.room.name + '.creeps.hostiles'] = 0;
  return false;
}

Creep.prototype.attackSpawns = function() {
  var targets = Game.rooms[this.pos.roomName].findHostileSpawn();
  if(targets !== undefined && targets.length > 0) {
    this.memory.moved = true;
    this.moveTo(targets[0]);
    this.attack(targets[0]);
    if(Math.random() > 0.9) {
      this.say('destroy', true);
    }
    return true;
  }
  return false;
}

Creep.prototype.healFriendly = function() {
  var wounded = Object.keys(Game.creeps).map(name => Game.creeps[name]).filter(creep => creep.hits < creep.hitsMax);
  if(wounded.length) {
    this.moveTo(wounded[0]);
    this.heal(wounded[0]);
    if(Math.random() > 0.9) {
      this.say('+++');
    }
    return true;
  }
  return false;
}
