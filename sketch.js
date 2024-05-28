
let numCircles = 30; // Number of circular shapes (Target number)
let circles = []; // Array to store circle objects
let bubbles = []; //Array to store bubbles
let sounds = []; //Array to store sounds
let currentSound = null;

let songAmpAnalyser;
let songAmp;
let mic; //Variable for mic input
let songFreqAnalyser; //FFT
let songFreq; //Spectrum
let songWave;//Waveform
let numBins = 128; //for FFT
let smoothing = 0.8; // for FFT

let startClick = false; // To prevent a drawing to start before the audio is allowed to play (browsers' restrection)

function preload() 
{
sounds.push(loadSound('assets/sound1.wav')); //https://freesound.org/people/joshuaempyre/sounds/250856/
sounds.push(loadSound('assets/sound2.wav')); //https://freesound.org/people/Timbre/sounds/157553/
sounds.push(loadSound('assets/sound3.wav')); //https://freesound.org/people/bebeto/sounds/554/
sounds.push(loadSound('assets/sound4.wav')); //https://freesound.org/people/waveplaySFX/sounds/540729/
sounds.push(loadSound('assets/sound5.wav')); //Week 11 Tutorial https://freesound.org/people/multitonbits/sounds/383935/?    
}


function setup() 
{
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100, 255);
  
  createCanvas(windowWidth, windowHeight);
  background(199,100,51,30);

  //Call the function to populate the circle components
  createNonOverlappingCircle();

  //Set up audio track and audio processors
  currentSound = sounds[0]; 

  songAmpAnalyser = new p5.Amplitude();
  songAmpAnalyser.setInput(currentSound);

  songFreqAnalyser = new p5.FFT(smoothing,numBins)
  currentSound.connect(songFreqAnalyser);

  //Welcome text
  textAlign(CENTER);
  textFont('Comic Sans MS')
  textSize(150);
  text("Hello!",width/2,height/6);
  textSize(50);
  text("It was a great semester !",width/2,height/3.75);
  textSize(40);
  text("For this code, you can toggle",width/2,height/3);
  textSize(35);
  text("between sounds by pressing 1-6,",width/2,height/2.55);
  textSize(26);
  text("'c' to regenerate the work and spacebar",width/2,height/2.2-9);
  textSize(24);
  text("to pause/play. Also, '6' is a mic input.",width/2,height/1.9-25);
  textSize(22);
  text("You might wonder, why is this here?",width/2,height/2+35);
  textSize(16);
  text("It just for the sounds to finish loading.",width/2,height/2+73);
  textSize(12);
  text("If you are ready, just click anywhere.",width/2,height/2+105);
  textSize(10);
  text("Thank you :)",width/2,height/2+140);
}

function draw() 
{
  //Obtaining various audio parameters
  songAmp = songAmpAnalyser.getLevel();
  songFreq = songFreqAnalyser.analyze();
  songWave = songFreqAnalyser.waveform();

  //Start drawing after user interacting with the browers,
  //so that the audio and the drawing can happen simultaneously.
  if (startClick)
    {
      //Background colour is modulated by the amplitude of the audio track.
      background(199+(songAmp*500),100,51,30);
      for (const circle of circles)
        {
          circle.display();
        }

      for(const bubble of bubbles)
        {
            bubble.bubbleDraw();
        }    

      for(let i = 0; i<10; i++) //Use for loop to speed up the process per frame
        {
          let tempBubble = new bubble(random(width),random(height), 5,color(random(360), random(100), random(50,100))); // HSB
          //let tempBubble = new bubble(mouseX,mouseY, random(5,30),color(random(360), random(100), random(50,100))); // Follow mouse, HSB

          //Check bubbles location with the existing bubbles and circles
          //before allowing it to be pushed into array.
          if (!checkBubbleOverlap(tempBubble)&&!checkBubbleOverlapWithCircle(tempBubble))
            {
              bubbles.push(tempBubble);
            }
        }

        //Soundwave in the middle of the circle from FFT.waveform().
        //A help from a generative AI was used in creating this logic.
        for (let k=0; k<circles.length;k++)
          {
          push();
          translate(circles[k].x,circles[k].y);
          beginShape();
          stroke(circles[k].smallCircleColor);
          strokeWeight(2);
          noFill();
          let radius = circles[k].diameter/10;
          for(let j = 0; j<songWave.length; j++)
            {
              //Calculating the angle ratio with the total objects in songWave array.
              let angle = map(j,0,songWave.length,0,360);

              let x = radius * cos(angle);
              let y = radius * sin(angle);

              //Modulating the radius with the data obtain from waveform()
              let waveRadius = radius + songWave[j] * 100;
              let waveX = waveRadius * cos(angle);
              let waveY = waveRadius * sin(angle);

              vertex(waveX,waveY);
            }
            endShape(close);
            pop();
          }
    }
        
}

//Initialisation click (required to overcome the browser audio restriction)
function mousePressed()
{
  if(!startClick)
    {
      startClick = true;
      frameCount = 0;
      currentSound.loop();
    }
}

//Audio track selection function
function keyPressed()
{
  if(startClick)
    {
      switch(key)
      {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if(key >= '1' && key<='5' && startClick)
            {
              let track = int(key) - 1; //Make it coresponds with object number in array. 

              currentSound.stop();

              currentSound = sounds[track];

              songAmpAnalyser = new p5.Amplitude();
              songAmpAnalyser.setInput(currentSound);
                
              songFreqAnalyser = new p5.FFT(smoothing,numBins);
              currentSound.connect(songFreqAnalyser);

              currentSound.loop();

              break;
            }
        
        //Case for microphone input.
        // A help from p5js reference page was used (https://p5js.org/reference/#/p5.AudioIn).
        case '6':
            currentSound.stop();
            
            mic = new p5.AudioIn();
            mic.start();
            //mic.connect(); //BEWARE FEEDBACK!

            currentSound = mic;

            songAmpAnalyser = new p5.Amplitude();
            songAmpAnalyser.setInput(currentSound);
          
            songFreqAnalyser = new p5.FFT(smoothing,numBins);
            currentSound.connect(songFreqAnalyser);

            break;
        
        //Case for regenerating the artwork by emptying the circles and bubbles arrays.
        case 'c':
          circles=[]
          createNonOverlappingCircle();
          bubbles=[];
          break;
        
        //Case for play/pause with spacebar
        case ' ':
          if(currentSound)
            {
              if(currentSound.isPlaying())
                {
                  currentSound.pause();
                }
                else
                {
                  currentSound.loop();
                }
            }
            else
            {
              currentSound.loop();
            }
            break;
      }
    }
}

function windowResized()
{
  resizeCanvas(windowWidth,windowHeight);
  bubbles=[]; //Clear bubble array when resize so more circles have a chance to populate.
  createNonOverlappingCircle(); //Call function to create more if number is not met.
}

//Function for cretaing the circle
function createNonOverlappingCircle() 
{
  for (let i = 0; i < numCircles; i++)  //Populating circles in to circles array
  {  
    let diameter = random(100, 250); //diameter of main circle
    let circleColor = color(random(360), random(100), random(50,100)); //colour of main circle HSB
    let numSmallCircles = round(random(15,20)); // Number of small circles around the diameter
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

//Function for checking bubble overlapping with other BUBBLES already in array
function checkBubbleOverlap(tempBubble)
{
  for (const bubble of bubbles)
    {
      //To prevent the function from checking a particular object against its self
      //relevant to the bubble growing check (more details in the bubbles class)
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

//Function for checking bubble overlapping with other CIRCLES already in array
function checkBubbleOverlapWithCircle(tempBubble)
{
  for (const circle of circles)
    {
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
    //A delay fade i of circles to help visualise the 'circle packing' design of bubbles
    if(frameCount<200)
      {

      }
      else
      //A help from a generative AI was used in creating the delay logic.
      {
        let startFadein = frameCount - 200;
        let alpha = map(startFadein, 0, 100, 0, 255);
        alpha = constrain(alpha, 0, 255);
        this.circleColor.setAlpha(alpha);
        this.smallCircleColor.setAlpha(alpha);

    // Draw main circle
    fill(this.circleColor);
    noStroke();
    //Circles diameter are modulated by the amplitude of the selected audio track.
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

//Class for creating bubbles
class bubble
{
  constructor(x,y,d,colour)
  {
  this.x = x;
  this.y = y;
  this.d = d;
  this.colour = colour;
  this.grow = true
  //Random number to pick the frequency bank from the FFT anaysed array.
  //Only 5-50 is used despite 128 in the array. This is because
  //The low to mid frequency are more active than the higher frequency,
  //which most of the time do not have any activity in them.
  this.freqRandom = round(random(5,50)) //To pick the frequency
  this.freqRandomHSB = map(this.freqRandom,5,50,0,360); //To pick the colour according to the frequency group.
  }

  bubbleDraw()
  {
    push();
    fill(this.colour);
    stroke(0);
    circle(this.x,this.y,this.d);
    pop();
    //If the diameter is big enough, create extra two bubbles in them.
    if(this.d>10)
      {
        push();
        fill(0,0,0,150);
        stroke(0);
        circle(this.x,this.y,this.d*0.75);        
        pop();

        //The colour and diameter of the most innter bubble reacts to the specific frequency.
        push();
        fill(this.freqRandomHSB,100,100);
        stroke(0);
        circle(this.x,this.y,this.d*0.5*(songFreq[this.freqRandom]/150));
        pop();
      }

      //This if statement will cause the bubble to grow until it touches neighbouring
      //bubbles or circles. This is why the continue statement in the checkBubbleOverlap()
      //is required in order to skip when it performs the boundary check with itself.
      //A help, inspiration and technique is taken from https://www.youtube.com/watch?v=yh1zsmoFCKQ.
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