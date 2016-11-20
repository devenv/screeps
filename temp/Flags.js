function Flags() {
}

Flags.prototype.process = function() {
  _.values(Game.flags).forEach(flag => {
    if(flag.name === 'd') {
      this.demolish(flag);
    }
  });
}

Flags.prototype.demolish = function(flag) {
  var miner = flag.room.creepsByRole('miner')[0];
  if(self.creep.name === miner.name) {
    miner.say('x_x');
    if(miner.carry.energy === miner.carryCapacity) {
      var trg = miner.room.getEnergySink();
      miner.moveTo(trg);
      miner.transfer(trg, RESOURCE_ENERGY);
    } else {
      var src = flag.room.lookForAt(LOOK_STRUCTURES, flag.pos)[0];
      if(src !== undefined) {
        miner.moveTo(src.pos);
        miner.dismantle(src);
      }
    }
    return;
  }
}


module.exports = Flags;
