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
  if(!this.creep.memory.repair && !this.creep.memory.controller && (this.creep.memory.site === undefined || Game.constructionSites[this.creep.memory.site] === undefined)) {
    var builders = this.creep.room.creepsByRole('builder');
    if(builders.filter(builder => builder.memory.controller).length < config.controller_upgraders) {
      this.creep.memory.controller = true;
      this.creep.memory.repair = false;
      this.creep.memory.site = this.creep.room.controller;
      this.creep.say("controller");
    } else {
      if(builders.filter(builder => !builder.memory.controller && !builder.memory.repair).length < config.builders) {
        var sites = Object.keys(Game.constructionSites);
        for(var i = 0; i < sites.length; i++) {
          var site = Game.constructionSites[sites[i]];
          if(!builders.some(builder => Game.constructionSites[builder.memory.site] !== undefined && !utils.samePos(Game.constructionSites[builder.memory.site].pos, site.pos))) {
            this.creep.say("build");
            this.creep.memory.site = sites[i];
            this.creep.memory.controller = false;
            this.creep.memory.repair = false;
            break;
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
        this.creep.say("controller");
      }
    }
  }

  if(this.creep.memory.mode === 'build' && this.creep.memory.site !== undefined && Game.constructionSites[this.creep.memory.site] !== undefined || this.creep.memory.controller || this.creep.memory.repair) {
    this.creep.withdrawFromNearby();
    if(this.creep.carry.energy === 0) {
      this.creep.goTo(Game.rooms[this.creep.memory.origin_room].getEnergySink(this.creep));
    } else {
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
            var structures = this.creep.room.lookForAt(LOOK_STRUCTURES, obj.pos.x, obj.pos.y);
            if(structures.length > 0) {
              structure = structures[0];
            } else {
              this.creep.memory.site = undefined;
            }
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

  if(Game.time % 50 === 0 && this.creep.memory.controller || Game.time % 200 === 0 && this.creep.memory.repair) {
    this.creep.say('reset');
    this.creep.memory.site = undefined;
    this.creep.memory.controller = false;
    this.creep.memory.repair = false;
  }
}


module.exports = Builder;
