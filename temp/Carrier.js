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

  if(Memory.has_cpu && this.creep.memory.target === undefined) {
    var room = this.creep.originRoom();
    var sources = room.sources().filter(source => !_.values(Game.creeps).some(creep => creep.memory.role === 'carrier' && utils.samePos(creep.memory.owner, source.pos)));
    if(sources.length > 0) {
      sources.some(source => {
        if(room.memory.source_containers.length > 0) {
          this.creep.memory.supplying = false;
          this.creep.memory.owner = source.pos;
          this.creep.memory.target = Game.getObjectById(room.memory.source_containers[0]).pos;
          return true;
        }
      });
    }
    if(Memory.has_cpu && this.creep.memory.target === undefined) {
      if(room.controller && room.controller.my && !_.values(Game.creeps).some(creep => creep.memory.role === 'carrier' && utils.samePos(creep.memory.owner, room.controller.pos))) {
        if(room.memory.controller_container) {
          var container = Game.getObjectById(room.memory.controller_container);
          if(container) {
            this.creep.memory.supplying = true;
            this.creep.memory.owner = room.controller.pos
            this.creep.memory.target = container.pos;
          }
        }
      }
    }
    if(Memory.has_cpu && Memory.terminal !== undefined) {
      var terminal = Game.getObjectById(Memory.terminal);
      if(terminal.store[RESOURCE_ENERGY] < config.terminal_min_energy) {
        this.creep.memory.supplying = true;
        this.creep.memory.owner = terminal.pos;
        this.creep.memory.target = terminal.pos;
      } else if(terminal.store[RESOURCE_ENERGY] > config.terminal_max_energy) {
        this.creep.memory.supplying = false;
        this.creep.memory.owner = terminal.pos;
        this.creep.memory.target = terminal.pos;
      }
    }
    if(Memory.has_cpu && this.creep.memory.target === undefined) {
      var towers = room.towers().sort((a, b)=> a.energy > b.energy ? 1 : -1);
      if(towers.length > 0) {
        this.creep.memory.supplying = true;
        this.creep.memory.owner = towers[0].pos;
        this.creep.memory.target = towers[0].pos;
      } else {
        this.creep.say('no target');
      }
    }
  }

  if(this.creep.memory.target !== undefined) {
    if(this.creep.memory.mode === 'load') {
      var src;
      if(this.creep.memory.supplying) {
        if(this.creep.memory.src === undefined) {
          var spawns = this.creep.originRoom().spawns();
          if(spawns.some(spawn => spawn.energy > spawn.energyCapacity / 2)) {
            src = utils.sortByDistance(spawns)[0];
          } else {
            src = this.creep.originRoom().getEnergySource(this.creep);
          }
          this.creep.memory.src = src.id;
        } else {
          src = Game.getObjectById(this.creep.memory.src);
        }
        if(this.creep.pos.isNearTo(src)) {
          if (src === this.creep.room.storage || this.creep.room.hasSpareEnergy || !this.creep.memory.supplying) {
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
        trg = Game.rooms[this.creep.memory.target.roomName].lookForAt(LOOK_STRUCTURES, this.creep.memory.target.x, this.creep.memory.target.y).filter(st => st.structureType === STRUCTURE_CONTAINER || st.structureType === STRUCTURE_TOWER || st.structureType === STRUCTURE_TERMINAL)[0];
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
      if(this.creep.memory.supplying && this.creep.carry.energy === 0) {
        this.creep.memory.supplying = undefined;
        this.creep.memory.owner = undefined;
        this.creep.memory.target = undefined;
        this.creep.memory.mode = 'load';
      }
    }
  }
}

module.exports = Carrier;

