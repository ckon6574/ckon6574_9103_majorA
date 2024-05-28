
let numCircles = 30; // Number of circular shapes
let circles = []; // Array to store circle objects
let bubbles = [];
let song;

let songAmpAnalyser;
let songAmp;

let songFreqAnalyser; //fft
let songFreq; //spectrum
let songWave;//waveform
let numBins = 128;
let smoothing = 0.8;

function preload() 
{
  //song = loadSound("assets/sound5.wav");
  //song = loadSound("assets/ssound4.wav"); //https://freesound.org/people/Timbre/sounds/157553/
  //song = loadSound("assets/sound1.wav"); //https://freesound.org/people/waveplaySFX/sounds/540729/
  song = loadSound("assets/sound2.wav"); //https://freesound.org/people/joshuaempyre/sounds/250856/
  //song = loadSound("assets/sound3.wav"); //https://freesound.org/people/bebeto/sounds/554/
}


function setup() 
{
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100, 255);

  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.mouseClicked(playSong);
  createNonOverlappingCircle();

  songAmpAnalyser = new p5.Amplitude();
  songAmpAnalyser.setInput(song);

  songFreqAnalyser = new p5.FFT(smoothing,numBins)
  song.connect(songFreqAnalyser);
}

function draw() 
{

  songAmp = songAmpAnalyser.getLevel();
  songFreq = songFreqAnalyser.analyze();
  songWave = songFreqAnalyser.waveform();

  //background(0,88,130,30); //RGB

  background(199,100,51,30); //HSB
  for (const circle of circles)
    {
      circle.display();
    }

  for(const bubble of bubbles)
    {
        bubble.bubbleDraw();
    }    

  for(let i = 0; i<10; i++)
    {
      //let tempBubble = new bubble(mouseX,mouseY, random(5,30),color(random(255), random(255), random(255))); // Follow mouse, RGB
      //let tempBubble = new bubble(random(width),random(height), 5,color(random(255), random(255), random(255))); // RGB
      let tempBubble = new bubble(random(width),random(height), 5,color(random(360), random(100), random(50,100))); // HSB
      //let tempBubble = new bubble(mouseX,mouseY, random(5,30),color(random(360), random(100), random(50,100))); // Follow mouse, RGB
      if (!checkBubbleOverlap(tempBubble)&&!checkBubbleOverlapWithCircle(tempBubble))
        {
          bubbles.push(tempBubble);
        }
    }

    for (let k=0; k<circles.length;k++)
      {
      push();
      translate(circles[k].x,circles[k].y);
      beginShape();
      stroke(circles[k].smallCircleColor);
      strokeWeight(2);
      noFill();
      //fill(circles[k].smallCircleColor);
      let radius = circles[k].diameter/10;
      for(let j = 0; j<songWave.length; j++)
        {
          let angle = map(j,0,songWave.length,0,360);

          let x = radius * cos(angle);
          let y = radius * sin(angle);

          let waveRadius = radius + songWave[j] * 100;
          let waveX = waveRadius * cos(angle);
          let waveY = waveRadius * sin(angle);

          vertex(waveX,waveY);
        }
        endShape(close);
        pop();
      }
        
}

function playSong()
{
    if (song.isPlaying()) {
      song.pause();
    } else {
      song.loop();
    }

}

function windowResized()
{
  resizeCanvas(windowWidth,windowHeight);
  bubbles=[]; //Clear bubble array when resize so more circles have a chance to populate.
  createNonOverlappingCircle(); //Call function to create more if number is not met.
}

function createNonOverlappingCircle() 
{
  for (let i = 0; i < numCircles; i++)  //Populating circles in to circles array
  {  
    let diameter = random(100, 250); //diameter of main circle
    //let circleColor = color(random(255), random(255), random(255)); //colour of main circle RGB
    let circleColor = color(random(360), random(100), random(50,100)); //colour of main circle HSB
    let numSmallCircles = round(random(15,20)); // Number of small circles around the diameter
    //let smallCircleColor = color(random(255), random(255), random(255)); //colour of small circle RGB
    let smallCircleColor = color(random(360), random(100), random(50,100)); //colour of small circle
    let numLayers = 5; // Number of layers inside the main circle
    let tempCircle = new Circle(random(width), random(height), diameter, circleColor, numSmallCircles, smallCircleColor, numLayers);

    if(checkOverlap(tempCircle))
      {
        tempCircle.x = random(width); //If true (overlap) keep randomising
        tempCircle.y = random(height);
      }
      else if(circles.length<numCircles) //If false (not overlap) check if the array objects are still less than numCircles
      {
        circles.push(tempCircle); //If total number is not met add more to array
        createNonOverlappingCircle(); //Keep restarting functions as it will stop after i=numCircles eventhough total is not met.
      }
      else
      {
        break; //If total is met break out of loop
      }

  }
}

//Checking the overlap with all existing circles array members
function checkOverlap(tempCircle) 
{
  for (let i = 0; i < circles.length; i++) 
    {
      let d = dist(tempCircle.x, tempCircle.y, circles[i].x, circles[i].y);
      if (d < (tempCircle.diameter / 2 + circles[i].diameter / 2)+5) // a help from a generative AI was used in creating the checking logic.
        {
          return true; //If overlapped, returns true.
        }
    }
  return false; //If not overlapped, returns false.
}

function checkBubbleOverlap(tempBubble)
{
  for (const bubble of bubbles)
    {
      if(tempBubble == bubble)
        {
          continue;
        }
          let d = dist(tempBubble.x,tempBubble.y,bubble.x,bubble.y);
          if(d <(tempBubble.d/2)+(bubble.d/2)+1.5)
            {
              return true;
            }
      }
    return false;
}

function checkBubbleOverlapWithCircle(tempBubble)
{
  for (const circle of circles)
    {
      if(tempBubble == circle)
        {
          continue;
        }
          let d = dist(tempBubble.x,tempBubble.y,circle.x,circle.y);
          if(d <(tempBubble.d/2)+(circle.diameter/2)+1)
            {
              return true;
            }
      }
    return false;
}

//Class for generating circle
class Circle 
{
  constructor(x, y, diameter, circleColor, numSmallCircles, smallCircleColor, numLayers)
  {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.circleColor = circleColor;
    this.numSmallCircles = numSmallCircles;
    this.smallCircleColor = smallCircleColor;
    this.numLayers = numLayers;
  }


  display() 
  {
    if(frameCount<300)
      {

      }
      else
      {
        let startFadein = frameCount - 300;
        let alpha = map(startFadein, 0, 100, 0, 255);
        alpha = constrain(alpha, 0, 255);
        this.circleColor.setAlpha(alpha);
        this.smallCircleColor.setAlpha(alpha);

    // Draw main circle
    fill(this.circleColor);
    noStroke();
    circle(this.x, this.y, this.diameter*(songAmp*2.5));

    //Drawing the center disk
    for (let i = 0; i<8; i++)
      {
        stroke(0,alpha);
        ellipse(this.x, this.y, this.diameter*0.5-(i*10));
      }
  

    // Draw small circles layers inside the main circle
    for (let l = 1; l <= this.numLayers; l++)
      {
        let layerRadius = this.diameter / 2 * (1 - l / (this.numLayers+5)); // a help from a generative AI was used in creating the layerRadius logic.
        for (let i = 0; i < this.numSmallCircles; i++) 
          {
            let angle = (360/this.numSmallCircles*i);
            let sx = this.x + cos(angle) * (layerRadius);
            let sy = this.y + sin(angle) * (layerRadius);
            fill(this.smallCircleColor);
            ellipse(sx, sy, 10);
          }
      }
  }
  }
}

class bubble
{
  constructor(x,y,d,colour)
  {
  this.x = x;
  this.y = y;
  this.d = d;
  this.colour = colour;
  this.grow = true
  this.freqRandom = round(random(10,40))
  this.freqRandomHSB = map(this.freqRandom,10,40,0,360);
  }

  bubbleDraw()
  {
    push();
    fill(this.colour);
    circle(this.x,this.y,this.d);
    pop();
    if(this.d>10)
      {
        push();
        fill(0,0,0,150);
        circle(this.x,this.y,this.d*0.75);        
        pop();

        push();
        fill(this.freqRandomHSB,100,100);
        circle(this.x,this.y,this.d*0.5*(songFreq[this.freqRandom]/150));
        pop();
      }

      if (this.grow)
        {
          this.d++;
          if(checkBubbleOverlap(this)||checkBubbleOverlapWithCircle(this))
            {
              this.grow=false;
            }
        }
  }
}
