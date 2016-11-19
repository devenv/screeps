var debug = true;

var config = require('Config');
var utils = require('Utils');
var Spawner = require('Spawner');
var Tower = require('Tower');
var Miner = require('Miner');
var Carrier = require('Carrier');
var GlobalCarrier = require('GlobalCarrier');
var Builder = require('Builder');
var Soldier = require('Soldier');
var Ranged = require('Ranged');
var Healer = require('Healer');
var RoomInjections = require('RoomInjections');
var CreepInjections = require('CreepInjections');

module.exports.loop = function () {
    Object.keys(Game.rooms).map(function(name) { return Game.rooms[name] }).forEach(function(room) {
        try {
            
            // var carrier = room.creepsByRole('carrier')[1];
            // carrier.say('yippie');
            // if(carrier.carry.energy === 0) {
            //     var src = room.lookForAt(LOOK_STRUCTURES, 42, 9).filter(function(st) { return st.structureType === 'container' })[0];
            //     carrier.moveTo(src.pos);
            //     carrier.withdraw(src, RESOURCE_ENERGY);
            // } else {
            //     var trg = room.getEnergySink();
            //     carrier.moveTo(trg);
            //     carrier.transfer(trg, RESOURCE_ENERGY);
            // }

            var spawner = new Spawner(room);
            spawner.spawn();
            var extensions = room.extensions();
            var ext = extensions[Math.floor(Math.random() * extensions.length)];
            var d =  Math.floor(Math.random() * 2) - 1;
            if(ext) {
                room.createConstructionSite(ext.pos.x + d, ext.pos.y + d, STRUCTURE_EXTENSION);
            }
        } catch(e) { console.log(e); if(debug) { throw e } }
    });
    Object.keys(Game.structures).map(function(st) { return Game.structures[st] }).forEach(function(st) {
        try {
            if(st.structureType === STRUCTURE_TOWER) {
              new Tower(st).act();
            }
        } catch(e) { console.log(e); if(debug) { throw e } }
    });
    Object.keys(Game.creeps).forEach(function(cr) {
        try {
            var creep = Game.creeps[cr];
            if(creep.memory.role === 'miner') {
                new Miner(creep).act();
            } else if(creep.memory.role === 'carrier') {
                new Carrier(creep).act();
            } else if(creep.memory.role === 'global_carrier') {
                new GlobalCarrier(creep).act();
            } else if(creep.memory.role === 'builder') {
                new Builder(creep).act();
            } else if(creep.memory.role === 'soldier') {
                new Soldier(creep).act();
            } else if(creep.memory.role === 'healer') {
                new Healer(creep).act();
            } else if(creep.memory.role === 'ranged') {
                new Ranged(creep).act();
            }
            if(creep.memory.stuck === undefined) {
                creep.memory.stuck = 0;
                creep.memory.same_pos = true;
                creep.memory.moved = false;
            }
            creep.memory.stuck++;
            creep.memory.same_pos = creep.memory.same_pos && utils.samePos(creep.memory.last_pos, creep.pos);
        } catch(e) { console.log(e); if(debug) { throw e } }
        
        try {
            var forceTwitchFlags = Object.keys(Game.flags).filter(function(flag) { return Game.flags[flag].name === 'twitch' }).map(function(name) { return Game.flags[name] });
            if(forceTwitchFlags.length > 0 || creep.memory.stuck > config.twitch_threshold) {
                if(forceTwitchFlags.length > 0 || (creep.memory.moved || Math.random() > 0.9) && creep.memory.same_pos || Math.random() < 1 / (config.twitch_threshold * 10)) {
                    creep.twitch();
                }
                creep.memory.same_pos = true;
                creep.memory.moved = false;
                creep.memory.stuck = 0;
            }
            if(forceTwitchFlags.length > 0) {
                forceTwitchFlags[0].remove();
            }
    
            creep.memory.last_pos = creep.pos;
        } catch(e) { console.log(e); if(debug) { throw e } }
    });
    
    
}
