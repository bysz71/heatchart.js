/*------------------------------------------
HeatChart class
Generate a canvas based HeatChart. This class will generate
a canvas, so canvas does not need to be defined in html file
before using. Simply new it, specify the html element you want to append
the heat map to and provide other required arguments.
usage:
new HeatChart(targetElement, dotArray, configuration);
arguments:
    targetElement: the dom you want to append this HeatChart into;
    dotArray: data to generate HeatChart, is an array of {x:x,y:y}, can be scaled 
              in percentage or in pixel, needs to be specified by 'scalemode'.
    configuration:
        scaleMode: 0 for percentage scale mode, other for pixel scale mode
        canvasWidth: pre-defined canvas width;
        canvasHeight: pre-defined canvas height;
        gradientMode: color mapping mode, currently choose from 0 - 5;
        gradientRadius: the radius for one circle, affects distribution.
        transparency: canvas transparency so you can lay it on a picture;
        displayMode: 0 for heat map, 1 for gray scale map, 2 for dots
------------------------------------------*/
var HeatChart = (function() {
    //constructor
    function HeatChart(targetElement , dotArray , configuration){
        this.dotArray = dotArray;

        this.scaleMode = (configuration.scaleMode == undefined ? 0 : configuration.scaleMode);
        this.canvasWidth = ((configuration.canvasWidth == undefined || configuration.canvasWidth == 0) ? targetElement.offsetWidth : configuration.canvasWidth);
        this.canvasHeight = ((configuration.canvasHeight == undefined || configuration.canvasHeight == 0) ? targetElement.offsetHeight : configuration.canvasHeight);
        this.gradientMode = (configuration.gradientMode == undefined ? 0 : configuration.gradientMode);
        this.gradientRadius = ((configuration.gradientRadius == undefined || configuration.gradientRadius == 0) ? 32 : configuration.gradientRadius);
        this.transparency = ((configuration.transparency == undefined || configuration.transparency == 0) ? 0.5 : configuration.transparency);
        this.displayMode = (configuration.displayMode == undefined ? 0 : configuration.displayMode);
        
        //decide grayScaleAlpha based on number of dots
        //grayScaleAlpha is the start color of one gradient gray scale dot
        if(this.dotArray.length <= 100) this.grayScaleAlpha = 0.2;
        else if(this.dotArray.length >= 2000) this.grayScaleAlpha = 0.048;
        else this.grayScaleAlpha = 0.208 - this.dotArray.length * 0.00008;
        
        //generate a canvas in targetElement dom to display HeatChart
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.canvas.style.position = 'absolute';
        targetElement.appendChild(this.canvas);
        
        //supported color gradient mode for color mapping
        this.gradientRainbow = { 
            // 0:      'rgba(0,0,0,0.0)',
            0.14:   'rgba(139,0,255,' + this.transparency + ')',
            0.28:   'rgba(0,0,255,' + this.transparency + ')',
            0.42:   'rgba(0,127,255,' + this.transparency + ')',
            0.56:   'rgba(0,255,0,' + this.transparency + ')',
            0.70:   'rgba(255,255,0,' + this.transparency + ')',
            0.84:   'rgba(255,164,0,' + this.transparency + ')',
            1.0:    'rgba(255,0,0,' + this.transparency + ')'
        }
        this.gradientWarm = {
            0:      'rgba(0,0,0,0.0)',
            0.4:    'rgba(255,255,153,' + this.transparency + ')',
            0.7:    'rgba(255,153,51,' + this.transparency + ')',
            1.0:    'rgba(255,0,0,' + this.transparency + ')'
        };
        this.gradientCold = {
            0:      'rgba(0,0,0,0.0)',
            0.4:    'rgba(102,255,102,' + this.transparency + ')',
            0.7:    'rgba(0,51,153,' + this.transparency + ')',
            1.0:    'rgba(153,0,204,' + this.transparency + ')'
        };
        this.gradientBurn = {
            0:      'rgba(0,0,0,0.0)',
            0.4:    'rgba(255,255,102,' + this.transparency + ')',
            0.7:    'rgba(255,102,0,' + this.transparency + ')',
            1.0:    'rgba(153,51,153,' + this.transparency + ')'
         };
        this.gradientLight = {
            0:      'rgba(0,0,0,0.0)',
            0.3:    'rgba(153,255,102,' + this.transparency + ')',
            0.5:    'rgba(255,255,0,' + this.transparency + ')',
            0.75:   'rgba(255,164,0,' + this.transparency + ')',
            1.0:    'rgba(255,0,0,' + this.transparency + ')'
        };
        
        if(this.displayMode == 2){
            this.drawDots();
        }else if (this.displayMode == 1){
            this.drawCircles();
        }else if (this.displayMode == 0){
            this.drawCircles();
            this.grayToColor();
        }
    }
    
    //create color spectrum canvas and return its data
    HeatChart.prototype.createColorSpectrum = function(){
        var gradientConfiguration;
        switch(this.gradientMode){
            case 0:
            gradientConfiguration = this.gradientRainbow;
            break;
            case 1:
            gradientConfiguration = this.gradientWarm;
            break;
            case 2:
            gradientConfiguration = this.gradientCold;
            break;
            case 3:
            gradientConfiguration = this.gradientBurn;
            break;
            case 4:
            gradientConfiguration = this.gradientLight;
            break;
            default:
            gradientConfiguration = this.gradientRaindow;
            break;
        }
        
        var spectrumCanvas = document.createElement('canvas');
        var spectrumCtx = spectrumCanvas.getContext('2d');
        spectrumCanvas.width = 256;
        spectrumCanvas.height = 1;
        
        var gradient = spectrumCtx.createLinearGradient(0 , 0 , 256 , 1);
        for (var colorStop in gradientConfiguration)
            gradient.addColorStop(colorStop , gradientConfiguration[colorStop]);
        spectrumCtx.fillStyle = gradient;
        spectrumCtx.fillRect(0 , 0 , 256 , 1);
        return spectrumCtx.getImageData(0 , 0 , 256 , 1).data;
    }
    
    //convert percentage coordinates to pixels
    HeatChart.prototype.toPixel = function(dot){
        return{
            x: dot.x / 100 * this.canvasWidth,
            y: dot.y / 100 * this.canvasHeight
        }
    }
    
    // draw a dot based on given coordinate, called by this.drawDots()
    HeatChart.prototype.drawOneDot = function(x , y){
        this.ctx.beginPath();
        this.ctx.arc(x , y , 3 , 0 , 2*Math.PI , false);
        this.ctx.fill();
    }
    
    //draw dots data as black dots on the canvas for test usage
    HeatChart.prototype.drawDots = function(){
        this.ctx.fillStyle = '#000000';
        var dotInPixel;
        for(var i = 0; i < this.dotArray.length ; i++){
            if(this.scaleMode == 0){
                dotInPixel = this.toPixel(this.dotArray[i]);
                this.drawOneDot(dotInPixel.x, dotInPixel.y);
            }else{
                this.drawOneDot(this.dotArray[i]);
            }
        }
    }
    
    //draw a transtargetElement radial gradient circle
    HeatChart.prototype.drawOneCircle = function(dot){
        var gradient = this.ctx.createRadialGradient(dot.x , dot.y , 1 , dot.x , dot.y , this.gradientRadius);
        this.ctx.beginPath();
        gradient.addColorStop(0 , 'rgba(0,0,0,' + this.grayScaleAlpha + ')');
        gradient.addColorStop(1.0 , 'rgba(0,0,0,0)');
        this.ctx.fillStyle = gradient;
        this.ctx.arc(dot.x , dot.y , this.gradientRadius , 2*Math.PI , false);
        this.ctx.fill();
    }
    
    //draw circles for each dot
    HeatChart.prototype.drawCircles = function(){
        var dotInPixel;
        for(var i = 0 ; i < this.dotArray.length ; i++){
            if(this.scaleMode == 0){
                dotInPixel = this.toPixel(this.dotArray[i]);
                this.drawOneCircle(dotInPixel);
            }else{
                this.drawOneCircle(this.dotArray[i]);
            }
        }
    }
    
    //convert grayscale image to color by mapping the color on colorband
    HeatChart.prototype.grayToColor = function(){
        var imageDataObject = this.ctx.getImageData(0 , 0 , this.canvasWidth , this.canvasHeight);
        var alphaMax = 0;
        var alpha;
        for(var i = 0 ; i < imageDataObject.data.length ; i += 4){
            alpha = imageDataObject.data[i + 3];
            if (alpha > alphaMax) alphaMax = alpha;
        }
        var ratio = 255 / alphaMax;
        for(var i = 0 ; i < imageDataObject.data.length ; i += 4){
            alpha = imageDataObject.data[i + 3];
            imageDataObject.data[i + 3] = Math.floor(alpha * ratio);
        }
        
        var colorSpectrum = this.createColorSpectrum();
        var alpha , colorR , colorG, colorB , colorA;
        for(var i = 0 ; i < imageDataObject.data.length ; i += 4){
            alpha = imageDataObject.data[i + 3];
            colorR = colorSpectrum[alpha * 4];
            colorG = colorSpectrum[alpha * 4 + 1];
            colorB = colorSpectrum[alpha * 4 + 2];
            colorA = colorSpectrum[alpha * 4 + 3];
            imageDataObject.data[i] = colorR;
            imageDataObject.data[i + 1] = colorG;
            imageDataObject.data[i + 2] = colorB;
            imageDataObject.data[i + 3] = colorA;
        }
        this.ctx.putImageData(imageDataObject, 0 , 0);
    }
    
    HeatChart.prototype.wipeCanvas = function(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    return HeatChart;
})();
