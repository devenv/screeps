var utils = require('Utils');
var config = require('Config');

function Carrier(creep) {
  this.creep = creep;
  this.room = creep.originRoom();
  if(this.creep.memory.mode === undefined) {
    this.creep.memory.mode = 'load';
  }
  // this.creep.memory.target = undefined;
}

Carrier.prototype.act = function() {
  if(Game.time % 50 === 0 && this.creep.memory.supplying) {
    this.creep.say('reset');
    this.creep.memory.supplying = undefined;
    this.creep.memory.target = undefined;
  }

  if(this.creep.memory.target === undefined) {
    this.creep.say("?");
    var containers = this.room.memory.source_containers.filter(container => !_.values(Game.creeps).some(creep => creep.memory.role === 'carrier' && creep.memory.target === container));
    if(containers.length > 0) {
      this.creep.memory.supplying = false;
      this.creep.memory.target = containers[0];
    }
    if(Memory.has_cpu && this.creep.memory.target === undefined) {
      if(this.room.controller_container && !_.values(Game.creeps).some(creep => creep.memory.role === 'carrier' && creep.memory.target === this.room.controller_container)) {
        this.creep.memory.supplying = true;
        this.creep.memory.target = this.room.memory.controller_container;
      }
    }
    if(Memory.has_cpu && Memory.terminal !== undefined) {
      var terminal = Game.getObjectById(Memory.terminal);
      if(terminal.store[RESOURCE_ENERGY] < config.terminal_min_energy) {
        this.creep.memory.supplying = true;
        this.creep.memory.target = terminal.id;
      } else if(terminal.store[RESOURCE_ENERGY] > config.terminal_max_energy) {
        this.creep.memory.supplying = false;
        this.creep.memory.target = terminal.id;
      }
    }
    if(Memory.has_cpu && this.creep.memory.target === undefined) {
      var towers = this.room.towers().sort((a, b)=> a.energy > b.energy ? 1 : -1);
      if(towers.length > 0) {
        this.creep.memory.supplying = true;
        this.creep.memory.target = towers[0].id;
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
          var spawns = this.room.spawns();
          if(spawns.some(spawn => spawn.energy > spawn.energyCapacity / 2)) {
            src = utils.sortByDistance(spawns)[0];
          } else {
            src = this.room.getEnergySource(this.creep);
          }
          this.creep.memory.src = src.id;
        } else {
          src = Game.getObjectById(this.creep.memory.src);
        }
        if(this.creep.pos.isNearTo(src)) {
          if (src === this.room.storage || this.room.hasSpareEnergy || !this.creep.memory.supplying) {
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
        src = Game.getObjectById(this.creep.memory.target);

        if(this.creep.pos.isNearTo(src)) {
          this.creep.withdraw(src, RESOURCE_ENERGY);
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
        trg = Game.getObjectById(this.creep.memory.target);
      } else {
        trg = this.room.getEnergySink(this.creep);
      }

      if(this.creep.pos.isNearTo(trg)) {
        this.creep.transfer(trg, RESOURCE_ENERGY);
      } else {
        this.creep.goTo(trg);
      }
      if(this.creep.carry.energy === 0) {
        if(this.creep.memory.supplying) {
          this.creep.memory.supplying = undefined;
          this.creep.memory.target = undefined;
        }
        this.creep.memory.mode = 'load';
      }
    }
  } else {
    this.creep.memory.sleep = config.carrier_sleep;
  }
}

module.exports = Carrier;

