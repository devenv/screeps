var utils = require('Utils');
var config = require('Config');

function Builder(creep) {
  this.creep = creep;
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
    var builders = this.creep.room.creepsByRole('builder');
    if(builders.filter(builder => builder.memory.controller).length < config.controller_upgraders) {
      this.creep.memory.controller = true;
      this.creep.memory.repair = false;
      this.creep.memory.site = this.creep.room.controller;
      this.creep.say("controller");
    }
    if(this.creep.memory.site === undefined) {
      if(builders.filter(builder => !builder.memory.controller && !builder.memory.repair).length <= config.builders) {
        var sites = Object.keys(Game.constructionSites);
        if(sites.length > 0) {
          var site = Game.constructionSites[sites[0]];
          this.creep.say("build");
          this.creep.memory.site = sites[0];
          this.creep.memory.controller = false;
          this.creep.memory.repair = false;
        }
      }
    }
    if(this.creep.memory.site === undefined) {
      var to_repair = this.creep.room.brokenStructures();
      if(to_repair.length > 0) {
        this.creep.say("repair");
        this.creep.memory.site = to_repair[0].id;
        this.creep.memory.controller = false;
        this.creep.memory.repair = true;
      }
    }
    if(this.creep.memory.site === undefined) {
      this.creep.memory.controller = true;
      this.creep.memory.repair = false;
      this.creep.memory.site = this.creep.room.controller;
      this.creep.say("idle->ctrlr");
    }
  }

  this.creep.withdrawFromNearby();
  if(this.creep.carry.energy === 0) {
    this.creep.memory.mode = 'load';
  }
  if(this.creep.memory.mode === 'load') {
    if(this.creep.carry.energy === this.creep.carryCapacity) {
      this.creep.memory.mode = 'build';
    } else {
      var trg = this.creep.room.getEnergySource(this.creep);
      this.creep.goTo(trg);
      this.creep.withdraw(trg, RESOURCE_ENERGY);
    }
  } else if(this.creep.memory.mode === 'build') {
    if(this.creep.memory.controller) {
      if(this.creep.pos.isNearTo(this.creep.room.controller)) {
        if(this.creep.carry.energy > 0) {
          this.creep.upgradeController(this.creep.room.controller);
        }
      } else {
        this.creep.goTo(this.creep.room.controller.pos);
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
