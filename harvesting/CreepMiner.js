
var Cache = require('Cache');
var ACTIONS = {
	HARVEST: 1,
	DEPOSIT: 2
};

function CreepMiner(creep, resourceManager) {
	this.cache = new Cache();
	this.creep = creep;
	this.resourceManager = resourceManager;
	this.resource = false;
};

CreepMiner.prototype.init = function() {
	this.remember('role', 'CreepMiner');

	if(!this.remember('source')) {
		var src = this.resourceManager.getAvailableResource();
		this.remember('source', src.id);
	}
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}
	if(this.moveToNewRoom() == true) {
		return;
	}

	this.resource = this.resourceManager.getResourceById(this.remember('source'));

	this.act();
};

CreepMiner.prototype.act = function() {
	var avoidArea = this.getAvoidedArea();

	this.giveEnergy();
	if(this.creep.carry.energy < this.creep.carryCapacity) {
	    var results = this.creep.pos.lookFor(LOOK_RESOURCES);
	    if (results.length > 0) {
	        this.creep.pickup(results[0]);
	    }
	}
	if(this.creep.carry.energy == this.creep.carryCapacity && !Object.keys(Game.creeps).some(function (creep) { return Game.creeps[creep].memory.role == 'CreepCarrier'})) {
	    if(this.creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE ) {
            this.creep.moveTo(Game.spawns['Spawn1']);
        }
	} else {
    	this.creep.moveTo(this.resource, {avoid: avoidArea});
    	this.creep.harvest(this.resource);
    	this.remember('last-energy', this.creep.carry.energy);
	}
}

CreepMiner.prototype.giveEnergy = function() {
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 1);
	if(creepsNear.length){
		for(var n in creepsNear){
			if(creepsNear[n].memory.role !== 'CreepMiner'){
				if(creepsNear[n].memory['last-energy'] == creepsNear[n].energy && creepsNear[n].carry.energy < creepsNear[n].carryCapacity) {
					this.creep.transfer(creepsNear[n], RESOURCE_ENERGY);
				}
			}
		}
	}
}

module.exports = CreepMiner;