
let numCircles = 30; // Number of circular shapes
let circles = []; // Array to store circle objects
let bubbles = [];


function setup() 
{
  angleMode(DEGREES);
  createCanvas(windowWidth, windowHeight);
  createNonOverlappingCircle();
}

function draw() 
{
  background(0,88,130,30);
  for(const bubble of bubbles)
    {
      bubble.bubbleDraw();
    }

  for (const circle of circles)
    {
      circle.display();
    }

  for(let i = 0; i<10; i++)
    {
      //let tempBubble = new bubble(mouseX,mouseY, random(5,30),color(random(255), random(255), random(255)));
      let tempBubble = new bubble(random(width),random(height), 5,color(random(255), random(255), random(255)));
      if (!checkBubbleOverlap(tempBubble)&&!checkBubbleOverlapWithCircle(tempBubble))
        {
          bubbles.push(tempBubble);
        }
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
    let circleColor = color(random(255), random(255), random(255)); //colour of main circle
    let numSmallCircles = round(random(30, 50)); // Number of small circles around the diameter
    let smallCircleColor = color(random(255), random(255), random(255)); //colour of small circle
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
        let test = frameCount - 300;
        let alpha = map(test, 0, 100, 0, 255);
        alpha = constrain(alpha, 0, 255);
        this.circleColor.setAlpha(alpha);
        this.smallCircleColor.setAlpha(alpha);

    // Draw main circle
    fill(this.circleColor);
    noStroke();
    circle(this.x, this.y, this.diameter);

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
        fill(0);
        circle(this.x,this.y,this.d*0.75);        
        pop();

        push();
        fill(190);
        circle(this.x,this.y,this.d*0.5);
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
