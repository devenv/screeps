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

  if(this.creep.memory.target === undefined) {
    _.values(Game.rooms).some(room => {
      var sources = room.find(FIND_SOURCES).filter(source => !_.values(Game.creeps).some(creep => creep.memory.role === 'carrier' && utils.samePos(creep.memory.target, source.pos)));
      if(sources.length > 0) {
        this.creep.memory.supplying = false;
        this.creep.memory.target = sources[0].pos;
        return true;
      } else {
        if(room.controller.my && !_.values(Game.creeps).some(creep => creep.memory.role === 'carrier' && utils.samePos(creep.memory.target, room.controller.pos))) {
          this.creep.memory.supplying = true;
          this.creep.memory.target = room.controller.pos;
          return true;
        } else {
          var towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}}).filter(tower => !_.values(Game.creeps).some(creep => creep.memory.role === 'carrier' && utils.samePos(creep.memory.target, tower.pos)));
          if(towers.length > 0) {
            this.creep.memory.supplying = true;
            this.creep.memory.target = room.controller.pos;
            return true;
          } else {
            this.creep.say('no target');
          }
        }
      }
    });
  }

  if(this.creep.memory.target !== undefined) {
    if(this.creep.memory.mode === 'load') {
      var src;
      if(this.creep.memory.supplying) {
        src = Game.rooms[this.creep.memory.origin_room].getEnergySink(this.creep);
        if(this.creep.pos.isNearTo(src)) {
          if ((this.creep.room.energyAvailable - src.energy) / this.creep.room.extensions().length > config.min_extension_energy && src.energy > config.min_spawn_energy) {
            this.creep.withdraw(src, RESOURCE_ENERGY);
            this.creep.memory.mode = 'unload';
          }
        } else {
          this.creep.goTo(src);
        }
      } else {
        src = Game.rooms[this.creep.memory.target.roomName].getPositionAt(this.creep.memory.target.x, this.creep.memory.target.y);
        this.creep.withdrawFromNearby();
        if(this.creep.carry.energy >= this.creep.carryCapacity) {
          this.creep.memory.mode = 'unload';
        } else {
          this.creep.goTo(src);
        }
      }
    } else if (this.creep.memory.mode === 'unload') {
      var trg;
      if(this.creep.memory.supplying) {
        trg = Game.rooms[this.creep.memory.target.roomName].getPositionAt(this.creep.memory.target.x, this.creep.memory.target.y);
      } else {
        trg = Game.rooms[this.creep.memory.origin_room].getEnergySink(this.creep);
      }

      this.creep.transferToNearby();

      if(this.creep.carry.energy === 0) {
        this.creep.memory.mode = 'load';
      } else {
        this.creep.goTo(trg);
      }
    }
  }
}

module.exports = Carrier;
