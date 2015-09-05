var Mask = (function(){
  function Mask(element,width,height,area,mode){
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.position = 'absolute';
    element.appendChild(this.canvas);

    if(mode == 0){
      this.ctx.fillStyle = 'rgba(51,204,51,0.2)';
      // this.ctx.strokeStyle = 'rgba(51,204,51,0.5)';
    }else{
      this.ctx.fillStyle = 'rgba(255,80,0,0.2)';
      // this.ctx.strokeStyle = 'rgba(255,80,01,0.5)';
    }

    this.area = area;
    this.pixelArea = [];
    this.areaToPixel();
    this.drawArea();
  }

  Mask.prototype.areaToPixel = function(){
    var width = this.canvas.width;
    var height = this.canvas.height;
    for(var dot in this.area){
      var x = Math.floor(width * dot.x / 100);
      var y = Math.floor(height * dot.y / 100);
      this.pixelArea.push({x:x,y:y});
    }
  }

  Mask.prototype.drawArea = function(){
    this.ctx.pathBegin;
    this.ctx.moveTo(this.area[0].x, this.area[0].y);
    for(var i = 1; i < this.area.length; i++){
      this.ctx.lineTo(this.area[i].x, this.area[i].y);
    }
    this.ctx.lineTo(this.area[0].x, this.area[0].y);
    this.ctx.clossPath;
    this.ctx.fill();
    // this.ctx.stroke();
  }
  return Mask;
})();
