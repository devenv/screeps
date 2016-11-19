
function Claimer(creep) {
  this.creep = creep;
  if(this.creep.memory.mode === undefined) {
    this.creep.memory.mode = 'claim';
  }
}

Claimer.prototype.act = function() {
  var self = this;
  if(self.creep.memory.target === undefined) {
    _.values(Game.flags).some(function(flag) {
      if(flag.name === 'claim') {
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
        self.creep.moveTo(self.creep.memory.target.x, self.creep.memory.target.y);
        self.attackController();
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

Claimer.prototype.attackController = function() {
  var controller = Game.rooms[this.creep.pos.roomName].controller;
  if(!controller.my) {
    this.creep.memory.moved = true;
    this.creep.moveTo(controller);
    this.creep.attackController(controller);
    if(Math.random() > 0.9) {
      this.creep.say('fatality', true);
    }
    return true;
  }
}

module.exports = Claimer;
