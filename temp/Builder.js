var utils = require('Utils');
var config = require('Config');

function Builder(creep) {
  this.creep = creep;
  this.room = creep.room;
  if(this.creep.memory.mode === undefined) {
    this.creep.memory.mode = 'build';
  }
  // this.creep.memory.site = undefined;
  // this.creep.memory.repair = false;
}

Builder.prototype.act = function() {
  if(Game.time % 50 === 0 && this.creep.memory.controller || Game.time % 200 === 0 && this.creep.memory.repair) {
    this.creep.say('reset');
    this.creep.memory.site = undefined;
    this.creep.memory.controller = false;
    this.creep.memory.repair = false;
  }
  if(!this.creep.memory.repair && !this.creep.memory.controller && (this.creep.memory.site === undefined || (!Game.constructionSites[this.creep.memory.site] && !Game.getObjectById(this.creep.memory.site)))) {
    this.creep.memory.site = undefined;
    var builders = this.room.modernCreeps['builder'].map(name => Game.creeps[name]);
    var count = builders.filter(builder => builder.memory.controller).length
    if(count < config.controller_upgraders && this.creep.room.controller.level < 8 || count < 1) {
      this.creep.memory.controller = true;
      this.creep.memory.repair = false;
      this.creep.memory.site = this.room.controller;
      this.creep.say("controller");
    }
    if(Memory.has_cpu && this.creep.memory.site === undefined) {
      if(builders.filter(builder => !builder.memory.controller && !builder.memory.repair).length <= config.builders) {
        var sites = _.shuffle(Object.keys(Game.constructionSites));
        if(sites.length > 0) {
          var site = Game.constructionSites[sites[0]];
          this.creep.say("build");
          this.creep.memory.site = sites[0];
          this.creep.memory.controller = false;
          this.creep.memory.repair = false;
        }
      }
    }
    if(Memory.has_cpu && this.creep.memory.site === undefined) {
      if(builders.filter(builder => builder.memory.repair).length < config.repairers) {
        var to_repair = this.room.broken_structures();
        if(to_repair.length > 0) {
          this.creep.say("repair");
          this.creep.memory.site = to_repair[0].id;
          this.creep.memory.controller = false;
          this.creep.memory.repair = true;
        }
      }
    }
    if(this.creep.memory.site === undefined) {
      if(Memory.has_cpu) {
        this.creep.memory.controller = true;
        this.creep.memory.repair = false;
        this.creep.memory.site = this.room.controller;
        this.creep.say("idle->ctrlr");
      }
    }
  }

  if(Memory.has_cpu && this.creep.carry.energy === 0 && !this.creep.memory.controller) {
    this.creep.memory.mode = 'load';
  }
  if(this.creep.memory.mode === 'load') {
    if(this.creep.carry.energy === this.creep.carryCapacity) {
      this.creep.memory.mode = 'build';
    } else {
      var trg = this.creep.originRoom().getEnergySource(this.creep);
      this.creep.goTo(trg);
      //if (trg === this.room.storage || this.room.hasSpareEnergy) {
        this.creep.withdraw(trg, RESOURCE_ENERGY);
      //}
    }
  } else if(this.creep.memory.mode === 'build') {
    if(this.creep.memory.controller) {
      this.creep.withdraw(Game.getObjectById(this.room.memory.controller_container), RESOURCE_ENERGY);
      if(this.creep.pos.isNearTo(this.room.controller)) {
        if(this.creep.carry.energy > 0) {
          this.creep.upgradeController(this.room.controller);
        }
      } else {
        this.creep.goTo(this.room.controller.pos);
      }
    } else if(this.creep.memory.repair) {
      var structure = Game.structures[this.creep.memory.site];
      if(structure === undefined) {
        var obj = Game.getObjectById(this.creep.memory.site);
        if(obj !== null) {
          structure = obj;
        } else {
          this.creep.memory.site = undefined;
        }
      }
      if(this.creep.pos.isNearTo(structure)) {
        if(this.creep.carry.energy > 0) {
          this.creep.repair(structure);
          if(structure.hits === structure.hitsMax) {
            this.creep.memory.site = undefined;
            this.creep.memory.repair = false;
          }
        }
      } else {
        if(structure !== undefined) {
          this.creep.goTo(structure.pos);
        }
      }
    } else {
      var site = Game.constructionSites[this.creep.memory.site];
      if(site !== undefined) {
        if(this.creep.pos.isNearTo(site)) {
          if(this.creep.carry.energy > 0) {
            this.creep.build(site);
          }
        } else {
          this.creep.goTo(site.pos);
        }
      }
    }
  }
}


module.exports = Builder;
