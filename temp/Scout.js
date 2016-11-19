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
        flag.remove();
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
      if(!self.creep.pos.isNearTo(self.creep.memory.target)) {
        self.creep.moveTo(self.creep.memory.target);
      }
      //var controller = Game.rooms[self.creep.memory.target.roomName].controller;
      //if(self.creep.pos.isNearTo(controller)) {
        //if(self.creep.claimController(controller) !== 0) {
          //self.creep.reserveController(controller);
        //}
      //} else {
        //self.creep.moveTo(controller);
      //}
    }
  }
}

module.exports = Scout;
