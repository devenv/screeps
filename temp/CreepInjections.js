var config = require('Config');
var utils = require('Utils');

var dirs = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
var energySinks = [STRUCTURE_CONTAINER, STRUCTURE_TOWER, STRUCTURE_SPAWN, STRUCTURE_EXTENSION]

Creep.prototype.act = function(actor) {
  this.level = this.memory.level;

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

  if(this.memory.sleep > 0) {
    this.memory.sleep--;
    return
  }

  if(!Memory.cpu_critical) {
    this.pickupEnergy();

    actor.act();

    if(this.carry.energy > 0) {
      if(_.include(['unload', 'mining'], this.memory.mode) && this.memory.role !== 'carrier') {
        var trg = this.pos.findInRange(FIND_MY_CREEPS, 1)
          .filter(cr => _.include(['load', 'build'], cr.memory.mode) && cr.carry.energy < cr.carryCapacity);
        if(trg.length > 0) {
          this.transfer(trg[0], RESOURCE_ENERGY);
          return
        }
      }
    }
  }
}

Creep.prototype.originRoom = function() {
  return Game.rooms[this.memory.origin_room];
}

Creep.prototype.renew = function() {
  var spawn = utils.sortByDistance(this.originRoom().spawns())[0];
  if(this.pos.isNearTo(spawn)) {
    this.transfer(spawn, RESOURCE_ENERGY);
    if(!this.originRoom().hasSpareEnergy || this.ticksToLive > config.renew_to_ttl || Math.random() < config.stop_renew_prob) {
      this.memory.mode = undefined;
    }
  } else {
    this.goTo(spawn.pos);
  }
}

Creep.prototype.pickupEnergy = function() {
  if(this.carryCapacity > 0 && this.carry.energy < this.carryCapacity) {
    var results = this.pos.lookFor(LOOK_ENERGY).filter(res => res.resourceType === RESOURCE_ENERGY);
    if (results.length > 0) {
      this.pickup(results[0]);
    }
  }
}

Creep.prototype.shouldRenew = function() { return !this.body.some(part => part.type === CLAIM) && this.originRoom().hasSpareEnergy && this.ticksToLive < config.renew_ttl && this.memory.level >= this.originRoom().level };

Creep.prototype.goTo = function(pos) {
  if(!Memory.cpu_critical) {
    var res = this.moveTo(pos, {reusePath: config.reuse_path_ticks, maxOps: config.path_max_ops});
    //if(pos && (pos.x || pos.pos.x)) {
    //var res;
    //var path = this.room.getPath(this.pos, pos.x ? pos : pos.pos, {serialize: true});
    //if(path) {
    //res = this.moveByPath(path);
    //} else {
    //res = this.moveTo(pos, {reusePath: config.reuse_path_ticks, maxOps: config.path_max_ops});
    //}
    if(res !== 0 && res !== ERR_TIRED) {
      res = this.moveTo(pos);
      if(res !== 0 && res !== ERR_TIRED) {
        this.say('stuck:' + res);
        this.memory.sleep = 10;
        if(Math.random() < 0.1) {
          this.twitch();
        }
      }
    }
  }
  //}
}

Creep.prototype.twitch = function() {
  this.say('twitch');
  this.move(dirs[Math.floor(Math.random() * dirs.length)]);
}

Creep.prototype.attackHostiles = function() {
  if(this.room.hostileCreeps && this.room.hostileCreeps.length > 0) {
    var target = this.room.find(FIND_HOSTILE_CREEPS, {filter: t => t.name !== 'Source Keeper'})[0];
    if(target !== null) {
      this.moveTo(target);
      if(this.body.some(part => part.type === ATTACK)) {
        this.attack(target);
      }
      if(this.body.some(part => part.type === RANGED_ATTACK)) {
        this.rangedAttack(target);
      }
      if(Math.random() > 0.9) {
        this.say('die', true);
      }
      Game.notify("Hostiles", 1);
      //Memory.stats[this.room.name + '.creeps.hostiles'] = 1;
      return true;
    }
  }
  //Memory.stats[this.room.name + '.creeps.hostiles'] = 0;
  return false;
}

Creep.prototype.attackSpawns = function() {
  var targets = this.room.hostile_spawns();
  if(targets !== undefined && targets.length > 0) {
    var trg = Game.getObjectById(targets[0]);
    this.moveTo(trg);
    if(this.body.some(part => part.type === ATTACK)) {
      this.attack(target);
    }
    if(this.body.some(part => part.type === RANGED_ATTACK)) {
      this.rangedAttack(target);
    }
    if(Math.random() > 0.9) {
      this.say('destroy', true);
    }
    return true;
  }
  return false;
}

Creep.prototype.healFriendly = function() {
  var wounded = _.flatten(_.values(this.room.modernCreeps)).filter(creep => creep.hits < creep.hitsMax);
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

