
var Claimer = (creep)=> {
  this.creep = creep;
  if(this.creep.memory.mode === undefined) {
    this.creep.memory.mode = 'claim';
  }
}

Claimer.prototype.act = ()=> {
  if(this.creep.memory.target === undefined) {
    _.values(Game.flags).some(flag => {
      if(flag.name === 'claim') {
        this.creep.memory.target = flag.pos;
        flag.remove();
        return true;
      }
    });
  }
  if(this.creep.memory.target !== undefined) {
    if(this.creep.room.name !== this.creep.memory.target.roomName) {
      var exitDir = this.creep.room.findExitTo(this.creep.memory.target.roomName);
      var exit = this.creep.pos.findClosestByPath(exitDir);
      this.creep.moveTo(exit);
    } else {
      if(!this.creep.pos.isNearTo(this.creep.memory.target)) {
        this.creep.moveTo(this.creep.memory.target.x, this.creep.memory.target.y);
        this.attackController();
      }
      //var controller = Game.rooms[this.creep.memory.target.roomName].controller;
      //if(this.creep.pos.isNearTo(controller)) {
        //if(this.creep.claimController(controller) !== 0) {
          //this.creep.reserveController(controller);
        //}
      //} else {
        //this.creep.moveTo(controller);
      //}
    }
  }
}

Claimer.prototype.attackController = ()=> {
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
