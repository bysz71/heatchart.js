var randomDots = function(n){
  var dots = [];
  for(var i = 0; i < n; i++){
    x = Math.floor(Math.random()*100)+1;
    y = Math.floor(Math.random()*100)+1;
    dots.push({x:x,y:y});
  }
  return dots;
}

var binomialDots = function(n){
  var dots = [];
  var dotNumber;
  var count = 0;
  for(var i = 0; i < 100; i++){
    if (i <= 50)
      dotNumber = Math.floor(Math.random()*i*i/50) + 1 + n;
    else
      dotNumber = Math.floor(Math.random()*(100-i)*(100-i)/50) + 1 + n;
    for (var j = 0; j < dotNumber; j++){
      x = i;
      y = Math.floor(Math.random()*(80))+10;
      dots.push({x:x,y:y});
      count++;
    }
  }
  console.debug(count);
  return dots;
}

var binomialDots2 = function(n){
  var dots = [];
  var dotNumber;
  var count = 0;
  for(var i = 20; i < 50; i++){
    if (i <= 35)
      dotNumber = Math.floor(Math.random()*i*i/35) + 1 + n;
    else
      dotNumber = Math.floor(Math.random()*(50-i)*(50-i)/15) + 1 + n;
    for (var j = 0; j < dotNumber; j++){
      x = i;
      y = Math.floor(Math.random()*(40))+10;
      dots.push({x:x,y:y});
      count++;
    }
  }
  console.debug(count);
  return dots;
}

var binomialDots3 = function(n){
  var dots = [];
  var dotNumber;
  var count = 0;
  for(var i =50; i < 80; i++){
    if (i <= 65)
      dotNumber = Math.floor(Math.random()*i*i/65) + 1 + n;
    else
      dotNumber = Math.floor(Math.random()*(80-i)*(80-i)/15) + 1 + n;
    for (var j = 0; j < dotNumber; j++){
      x = i;
      y = Math.floor(Math.random()*(10))+10;
      dots.push({x:x,y:y});
      count++;
    }
  }
  console.debug(count);
  return dots;
}

$(document).ready(function(){
  var dots = randomDots(1000);
  // var dots = binomialDots(0);
  // var dots = [];
  // var dotsTemp = randomDots(10000);
  // dots = dots.concat(dotsTemp);

  
  
  // var dots2 = binomialDots3(0);
  // var dotsTemp2 = randomDots(100);
  // dots2 = dots2.concat(dotsTemp2);

  // var heat2 = new HeatMap($('#canvas')[0],dots2,600,600,2);
  var heat1 = new HeatMap($('#canvas')[0],dots,600,600,0,1.0);

  // var area = [{x:100,y:100},{x:250,y:100},{x:300,y:200},{x:200,y:230},{x:80,y:200}];
  // 
  // var mask = new Mask($('#canvas')[0],600,600,area,0);
  // 
  // var area2 = [{x:300,y:300},{x:450,y:300},{x:500,y:400},{x:400,y:430},{x:220,y:400}];
  // 
  // var mask2 = new Mask($('#canvas')[0],600,600,area2,1);
});
