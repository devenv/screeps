var Cache = require('Cache');
function Resources(room, population) {
	this.cache = new Cache();
	this.room = room;
	this.population = population;
}

Resources.prototype.getAvailableResource = function() {
	// Some kind of unit counter per resource (with Population)
	var srcs = this.getSources();
	var srcIndex = Math.floor(Math.random()*srcs.length);

	return srcs[srcIndex];
};

Resources.prototype.getResourceById = function(id) {
	return Game.getObjectById(id);
};

var freeSpot = function(pos, dx, dy, room, workerPositions) {
    return Game.map.getTerrainAt(pos.x + dx, pos.y + dy, room) !== 'wall' && !workerPositions.some(function(wpos) { return pos.x == wpos.x && pos.y == wpos.y });
};

Resources.prototype.getSources = function(room) {
    workerPositions = Object.keys(Game.creeps).filter(function(creep) { return Game.creeps[creep].role === 'CreepMiner'}).map(function(creep) { return [creep.pos.x, creep.pos.y]});
	return this.cache.remember(
		'sources',
		function() {
			return this.room.find(
				FIND_SOURCES, {
					filter: function(src) {
						var targets = src.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
						if(targets.length == 0) {
						    if (freeSpot(src.pos, -1, -1, room, workerPositions)) { return true; }
    						if (freeSpot(src.pos, 0, -1, room, workerPositions)) { return true; }
    						if (freeSpot(src.pos, 1, -1, room, workerPositions)) { return true; }
    						if (freeSpot(src.pos, -1, 0, room, workerPositions)) { return true; }
    						if (freeSpot(src.pos, 1, 0, room, workerPositions)) { return true; }
    						if (freeSpot(src.pos, -1, 1, room, workerPositions)) { return true; }
    						if (freeSpot(src.pos, 0, 1, room, workerPositions)) { return true; }
    						if (freeSpot(src.pos, 1, 1, room, workerPositions)) { return true; }
						}

						return false;
					}
				}
			);
		}.bind(this)
	);
};

module.exports = Resources;