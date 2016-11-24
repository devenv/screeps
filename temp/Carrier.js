var utils = require('Utils');
var config = require('Config');

function Carrier(creep) {
  this.creep = creep;
  if(this.creep.memory.mode === undefined) {
    this.creep.memory.mode = 'load';
  }
  // this.creep.memory.target = undefined;
}

Carrier.prototype.act = function() {
  if(Game.time % 50 === 0 && this.creep.memory.supplying) {
    this.creep.say('reset');
    this.creep.memory.supplying = undefined;
    this.creep.memory.owner = undefined;
    this.creep.memory.target = undefined;
  }

  if(this.creep.memory.target === undefined) {
    _.values(Game.rooms).some(room => {
      var sources = room.find(FIND_SOURCES).filter(source => !_.values(Game.creeps).some(creep => creep.memory.role === 'carrier' && utils.samePos(creep.memory.owner, source.pos)));
      if(sources.length > 0) {
        var containers = sources[0].pos.findInRange(FIND_STRUCTURES, 3, {filter: {structureType: STRUCTURE_CONTAINER}});
        if(containers.length > 0) {
          this.creep.memory.supplying = false;
          this.creep.memory.owner = sources[0].pos;
          this.creep.memory.target = containers[0].pos;
          return true;
        }
      }
      if(this.creep.memory.target === undefined) {
        if(room.controller.my && !_.values(Game.creeps).some(creep => creep.memory.role === 'carrier' && utils.samePos(creep.memory.owner, room.controller.pos))) {
          var containers = room.controller.pos.findInRange(FIND_STRUCTURES, 3, {filter: {structureType: STRUCTURE_CONTAINER}});
          if(containers.length > 0) {
            this.creep.memory.supplying = true;
            this.creep.memory.owner = room.controller.pos
            this.creep.memory.target = containers[0].pos;
            return true;
          }
        }
      }
      if(this.creep.memory.target === undefined) {
        var towers = room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}}).sort((a, b)=> a.energy > b.energy ? 1 : -1);
        if(towers.length > 0) {
          this.creep.memory.supplying = true;
          this.creep.memory.owner = towers[0].pos;
          this.creep.memory.target = towers[0].pos;
          return true;
        } else {
          this.creep.say('no target');
        }
      }
    });
  }

  if(this.creep.memory.target !== undefined) {
    if(this.creep.memory.mode === 'load') {
      var src;
      if(this.creep.memory.supplying) {
        if(this.creep.memory.src === undefined) {
          var spawn = this.creep.originRoom().spawn();
          if(spawn.energy > spawn.energyCapacity / 2) {
            src = spawn;
          } else {
            var exts = this.creep.originRoom().extensions().filter(ext => ext.energy > 0).sort((a, b) => this.creep.pos.getRangeTo(a) > this.creep.pos.getRangeTo(b) ? 1 : -1)
            if(exts.length > 0) {
              src = exts[0];
            } else {
              src = spawn
            }
          }
          this.creep.memory.src = src.id;
        } else {
          src = Game.getObjectById(this.creep.memory.src);
        }
        if(this.creep.pos.isNearTo(src)) {
          var extensions = this.creep.room.extensions().length;
          if (extensions === 0 || (this.creep.room.energyAvailable - src.energy) / extensions) > config.min_extension_energy) {
            this.creep.withdraw(src, RESOURCE_ENERGY);
            this.creep.memory.src = undefined;
          } else {
            this.creep.say('no energy');
          }
          if(this.creep.carry.energy >= this.creep.carryCapacity) {
            this.creep.memory.mode = 'unload';
          }
        } else {
          this.creep.goTo(src);
        }
      } else {
        src = Game.rooms[this.creep.memory.target.roomName].getPositionAt(this.creep.memory.target.x, this.creep.memory.target.y);

        if(this.creep.pos.isNearTo(src)) {
          this.creep.withdrawFromNearby();
        } else {
          this.creep.goTo(src);
        }
        if(this.creep.carry.energy >= this.creep.carryCapacity) {
          this.creep.memory.mode = 'unload';
        }
      }
    } else if (this.creep.memory.mode === 'unload') {
      var trg;
      if(this.creep.memory.supplying) {
        trg = Game.rooms[this.creep.memory.target.roomName].lookForAt(LOOK_STRUCTURES, this.creep.memory.target.x, this.creep.memory.target.y).filter(st => st.structureType === STRUCTURE_CONTAINER || st.structureType === STRUCTURE_TOWER)[0];
      } else {
        trg = this.creep.originRoom().getEnergySink(this.creep);
      }

      if(this.creep.pos.isNearTo(trg)) {
        this.creep.transfer(trg, RESOURCE_ENERGY);
      } else {
        var carriers = this.creep.pos.findInRange(FIND_MY_CREEPS).filter(creep => creep.memory.role === 'carrier' && creep.memory.supplying && creep.carry.energy < creep.carryCapacity);
        if(carriers.length > 0) {
          this.creep.transfer(carriers[0], RESOURCE_ENERGY);
        }
        this.creep.goTo(trg);
      }
      if(this.creep.carry.energy === 0) {
        this.creep.memory.supplying = undefined;
        this.creep.memory.owner = undefined;
        this.creep.memory.target = undefined;
        this.creep.memory.mode = 'load';
      }
    }
  }
}

module.exports = Carrier;

