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
      self.creep.goTo(self.creep.memory.target);
    }
}

module.exports = Scout;
