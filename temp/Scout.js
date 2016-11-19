function Scout(creep) {
    this.creep = creep;
    if(this.creep.memory.mode === undefined) {
        this.creep.memory.mode = 'scout';
    }
}

Scout.prototype.act = function() {
    var self = this;
    if(self.creep.memory.target === undefined) {
      _.values(Game.flags).some(function(flag) {
        if(flag.name === 'scout') {
          self.creep.memory.target = flag.pos;
          return true;
        }
      });
    }
    if(self.creep.memory.target !== undefined) {
      if(self.creep.room.name !== self.creep.memory.target.roomName) {
        var exitDir = self.creep.room.findExitTo(self.creep.memory.target.roomName);
        var exit = self.creep.pos.findClosestByPath(exitDir);
        self.creep.moveTo(exit);
      } else {
        self.creep.moveTo(self.creep.memory.target.x, self.creep.memory.target.y);
      }
    }
}

module.exports = Scout;
