/*------------------------------------------
HeatMap class
Generate a canvas based heatmap. This class will generate
a canvas, so canvas does not need to be defined in html file
before using. Simply new it, specify the dom you want to append
the heat map to and provide other required arguments.
usage:
new HeatMap(element, dots, width, height, mode);
arguments:
element: the dom you want to append this heatmap into;
dots: data to generate heatmap, is an array of {x:x,y:y};
width: canvas width as you want;
height: canvas height as you want;
mode: color mapping mode, currently choose from 0 - 5
------------------------------------------*/
var HeatMap = (function() {
    //constructor
    function HeatMap(element,dots,width,height,mode,opacity){
        this.data = dots;
        this.mode = mode;
        this.opacity = opacity;
        
        this.numberOfDots = this.data.length;
        if(this.numberOfDots <= 100)
            this.grayScaleAlpha = 0.2;
        else if(this.numberOfDots >= 2000)
            this.grayScaleAlpha = 0.048;
        else
            this.grayScaleAlpha = 0.208 - this.numberOfDots * 0.00008;
        console.debug(this.grayScaleAlpha);
        
        if(width == 0 || height == 0){
            this.width = element.width;
            this.height = element.height;
        }else{
            this.width = width;
            this.height = height;
        }
        
        this.width = width;
        this.height = height;
        
        //define a canvas and append to given dom
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.position = 'absolute';
        element.appendChild(this.canvas);
        
        //supported color theme for color mapping
        this.gradRainbow = { 0.14: 'rgba(139,0,255,'+this.opacity+')', 0.28: 'rgba(0,0,255,'+this.opacity+')',0.42:'rgba(0,127,255,'+this.opacity+')',0.56:'rgba(0,255,0,'+this.opacity+')',0.70: 'rgba(255,255,0,'+this.opacity+')', 0.84:'rgba(255,164,0,'+this.opacity+')',1.0:'rgba(255,0,0,'+this.opacity+')'}
        this.gradWarm = {0:'rgba(0,0,0,0.0)',0.4:'rgba(255,255,153,'+this.opacity+')',0.7:'rgba(255,153,51,'+this.opacity+')', 1.0:'rgba(255,0,0,0.5)'};
        this.gradCold = {0:'rgba(0,0,0,0.0)',0.4:'rgba(102,255,102,'+this.opacity+')',0.7:'rgba(0,51,153,'+this.opacity+')', 1.0:'rgba(153,0,204,0.5)'};
        this.gradBurn = {0:'rgba(0,0,0,0.0)',0.4:'rgba(255,255,102,'+this.opacity+')', 0.7:'rgba(255,102,0,'+this.opacity+')',1.0:'rgba(153,51,153,'+this.opacity+')'};
        this.gradLight = {0:'rgba(0,0,0,0.0)',0.3:'rgba(153,255,102,'+this.opacity+')',0.5:'rgba(255,255,0,'+this.opacity+')',0.75:'rgba(255,164,0,'+this.opacity+')',1.0:'rgba(255,0,0,'+this.opacity+')'};
        
        //draw grayscale image
        this.drawCircles();
        
        //convert it to color image
        this.grayToColor();
    }
    
    //create color spectrum and initialize this.colorband
    HeatMap.prototype.colorBand = function(mode){
        switch(mode){
            case 0:
            var gradConf = this.gradRainbow;
            break;
            case 1:
            var gradConf = this.gradWarm;
            break;
            case 2:
            var gradConf = this.gradCold;
            break;
            case 3:
            var gradConf = this.gradBurn;
            break;
            case 4:
            var gradConf = this.gradLight;
            break;
            default:
            var gradConf = this.gradTransparent;
            break;
        }
        
        var band = document.createElement('canvas');
        var ctx = band.getContext('2d');
        band.width = 256;
        band.height = 1;
        
        var gradient = ctx.createLinearGradient(0,0,256,1);
        for (var stop in gradConf)
        gradient.addColorStop(stop, gradConf[stop]);
        ctx.fillStyle = gradient;
        // ctx.globalAlpah = 0.5;
        ctx.fillRect(0,0,256,1);
        return ctx.getImageData(0,0,256,1).data;
    }
    
    //convert percentage coordinates to pixels
    HeatMap.prototype.toPixel = function(dot){
        return{
            x: dot.x / 100 * this.width,
            y: dot.y / 100 * this.height
        }
    }
    
    //draw a dot based on given coordinate, called by this.drawDots()
    HeatMap.prototype.drawDot = function(x,y){
        this.ctx.beginPath();
        this.ctx.arc(x,y,3,0,2*Math.PI,false);
        this.ctx.fill();
    }
    
    //draw data as black dots on the canvas for test usage
    HeatMap.prototype.drawDots = function(){
        this.ctx.fillStyle = '#000000';
        for(var i = 0; i < this.data.length ; i++){
            dotPixel = this.toPixel(this.data[i]);
            this.drawDot(dotPixel.x, dotPixel.y);
        }
    }
    
    //draw a transparent radial gradient circle
    HeatMap.prototype.drawCircle = function(dot){
        var gradient = this.ctx.createRadialGradient(dot.x,dot.y,1,dot.x,dot.y,30);
        this.ctx.beginPath();
        gradient.addColorStop(0,'rgba(0,0,0,'+this.grayScaleAlpha+')');
        gradient.addColorStop(1.0,'rgba(0,0,0,0)');
        this.ctx.fillStyle = gradient;
        this.ctx.arc(dot.x,dot.y,32,2*Math.PI,false);
        this.ctx.fill();
    }
    
    //draw circles for each dot
    HeatMap.prototype.drawCircles = function(){
        for(var i = 0; i < this.data.length ; i++){
            dotPixel = this.toPixel(this.data[i]);
            this.drawCircle(dotPixel);
        }
    }
    
    //convert grayscale image to color by mapping the color on colorband
    HeatMap.prototype.grayToColor = function(){
        var imgInfo = this.ctx.getImageData(0,0,this.width,this.height);
        var grayMax = 0;
        for(var i = 0; i < imgInfo.data.length; i = i + 4){
            var gray = imgInfo.data[i+3];
            if (gray > grayMax)
            grayMax = gray;
        }
        var ratio = 255/grayMax;
        for(var i = 0; i < imgInfo.data.length; i = i + 4){
            var gray = imgInfo.data[i+3];
            imgInfo.data[i+3] = Math.floor(gray * ratio);
        }
        
        var colorCorrect = this.colorBand(this.mode);
        for(var i = 0; i < imgInfo.data.length; i = i + 4){
            var gray = imgInfo.data[i+3];
            var colorR = colorCorrect[gray*4];
            var colorG = colorCorrect[gray*4+1];
            var colorB = colorCorrect[gray*4+2];
            var colorA = colorCorrect[gray*4+3];
            imgInfo.data[i] = colorR;
            imgInfo.data[i+1] = colorG;
            imgInfo.data[i+2] = colorB;
            imgInfo.data[i+3] = colorA;
        }
        this.ctx.putImageData(imgInfo,0,0);
    }
    return HeatMap;
})();
