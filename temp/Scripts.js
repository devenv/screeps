var setups = require('UnitSetups');

module.exports = {
    brokenRoads: function() {
        Object.keys(Game.rooms).forEach(function(roomName) {
           var roads = Game.rooms[roomName].find(FIND_STRUCTURES).filter(function(st) { return st.structureType === STRUCTURE_ROAD });
           var broken = roads.filter(function(road) { return road.hits < road.hitsMax });
           var hits = broken.reduce(function(s, road) { return s += road.hits }, 0);
           var max = broken.reduce(function(s, road) { return s += road.hitsMax }, 0);
           console.log("roads: " + roads.length + ", broken: " + broken.length + ", state: " + (Math.round(hits / max * 100)) + ", to fix: " + (max - hits));
        });
    },

    claimer: function() {
      _.values(Game.spawns)[0].createCreep(setups['claimer'][100], 'claimer' + Math.random(), {"role": 'claimer', "level": 100});
    }

};
