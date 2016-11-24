var setups = require('UnitSetups');

module.exports = {
    brokenRoads: function() {
        Object.keys(Game.rooms).forEach(roomName => {
           var roads = Game.rooms[roomName].find(FIND_STRUCTURES).filter(st => st.structureType === STRUCTURE_ROAD);
           var broken = roads.filter(road => road.hits < road.hitsMax);
           var hits = broken.reduce((s, road) => s += road.hits, 0);
           var max = broken.reduce((s, road) => s += road.hitsMax, 0);
           console.log("roads: " + roads.length + ", broken: " + broken.length + ", state: " + (Math.round(hits / max * 100)) + ", to fix: " + (max - hits));
        });
    },

    claimer1: function() {
      console.log(_.values(Game.spawns)[0].createCreep(setups['claimer'][1], 'claimer' + _.floor(Math.random() * 1000), {"role": 'claimer', "level": 100}));
    },

    claimer2: function() {
      console.log(_.values(Game.spawns)[0].createCreep(setups['claimer'][2], 'claimer' + _.floor(Math.random() * 1000), {"role": 'claimer', "level": 100}));
    },

    scout: function() {
      console.log(_.values(Game.spawns)[0].createCreep(setups['scout'][1], 'scout' + _.floor(Math.random() * 1000), {"role": 'scout', "level": 100}));
    }
};
