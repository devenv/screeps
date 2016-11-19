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
    var self = this;
    if(!self.creep.memory.repair && !self.creep.memory.controller && (self.creep.memory.site === undefined || Game.constructionSites[self.creep.memory.site] === undefined)) {
        var builders = self.creep.room.creepsByRole('builder');
        if(builders.filter(function(builder) { return builder.memory.controller; }).length < config.controller_upgraders) {
            self.creep.memory.controller = true;
            self.creep.memory.repair = false;
            self.creep.memory.site = self.creep.room.controller;
            self.creep.say("controller");
        } else {
            if(builders.filter(function(builder) { return !builder.memory.controller && !builder.memory.repair }).length < config.builders) {
                var sites = Object.keys(Game.constructionSites);
                for(var i = 0; i < sites.length; i++) {
                    var site = Game.constructionSites[sites[i]];
                    if(!builders.some(function(builder) { return Game.constructionSites[builder.memory.site] !== undefined && !utils.samePos(Game.constructionSites[builder.memory.site].pos, site.pos); })) {
                        self.creep.say("build");
                        self.creep.memory.site = sites[i];
                        self.creep.memory.controller = false;
                        self.creep.memory.repair = false;
                        break;
                    }
                }
            }
            if(self.creep.memory.site === undefined) {
                var to_repair = self.creep.room.brokenStructures();
                if(to_repair.length > 0) {
                    self.creep.say("repair");
                    self.creep.memory.site = to_repair[0].id;
                    self.creep.memory.controller = false;
                    self.creep.memory.repair = true;
                }
            }
            if(self.creep.memory.site === undefined) {
                self.creep.memory.controller = true;
                self.creep.memory.repair = false;
                self.creep.memory.site = self.creep.room.controller;
                self.creep.say("controller");
            }
        }
    }
    
    if(self.creep.ticksToLive < config.renew_ttl && self.creep.memory.level >= self.creep.room.memory.level) {
        self.creep.memory.mode = 'renew';
    }
    
    if(self.creep.memory.mode === 'build' && self.creep.memory.site !== undefined && Game.constructionSites[self.creep.memory.site] !== undefined || self.creep.memory.controller || self.creep.memory.repair) {
        self.creep.withdrawFromNearby();
        if(self.creep.carry.energy < self.creep.carryCapacity / 2) {
            self.creep.pos.findInRange(FIND_CREEPS, 1).forEach(function(creep) {
               if(creep.memory.role == 'carrier') {
                   creep.transfer(self.creep, RESOURCE_ENERGY);
               } 
            });
        }
        if(self.creep.memory.controller) {
            if(self.creep.pos.isNearTo(self.creep.room.controller)) {
                if(self.creep.carry.energy > 0) {
                    self.creep.upgradeController(self.creep.room.controller);
                }
            } else {
                self.creep.goTo(self.creep.room.controller.pos);
            }
         } else if(self.creep.memory.repair) {
            var structure = Game.structures[self.creep.memory.site];
            if(structure === undefined) {
                var obj = Game.getObjectById(self.creep.memory.site);
                if(obj !== null) {
                    var structures = self.creep.room.lookForAt(LOOK_STRUCTURES, obj.pos.x, obj.pos.y);
                    if(structures.length > 0) {
                        structure = structures[0];
                    } else {
                        self.creep.memory.site = undefined;
                    }
                } else {
                    self.creep.memory.site = undefined;
                }
            }
            if(self.creep.pos.isNearTo(structure)) {
                if(self.creep.carry.energy > 0) {
                    self.creep.repair(structure);
                    if(structure.hits === structure.hitsMax) {
                        self.creep.memory.site = undefined;
                        self.creep.memory.repair = false;
                    }
                }
            } else {
                if(structure !== undefined) {
                    self.creep.goTo(structure.pos);
                }
            }
         } else {
             var site = Game.constructionSites[self.creep.memory.site];
             if(self.creep.pos.isNearTo(site)) {
                if(self.creep.carry.energy > 0) {
                    self.creep.build(site);
                }
            } else {
                self.creep.goTo(site.pos);
            }
        }
    }
    if(self.creep.memory.mode === 'renew') {
        var spawn = Game.spawns[self.creep.room.memory.spawn];
        if(self.creep.pos.isNearTo(spawn)) {
            self.creep.transfer(spawn, RESOURCE_ENERGY);
            spawn.renewCreep(self.creep);
            if(self.creep.ticksToLive > config.renew_to_ttl || Math.random() < config.stop_renew_prob) {
                // self.creep.withdraw(spawn, RESOURCE_ENERGY);
                self.creep.memory.mode = 'build';
            }
        } else {
            self.creep.goTo(spawn.pos);
        }
    }

    if(Game.time % 50 === 0 && self.creep.memory.controller || Game.time % 200 === 0 && self.creep.memory.repair) {
        self.creep.say('reset');
        self.creep.memory.site = undefined;
        self.creep.memory.controller = false;
        self.creep.memory.repair = false;
     }
}


module.exports = Builder;