let numCircles = 20; // Number of circular shapes
let circles = []; // Array to store circle objects


function setup() 
{
  angleMode(DEGREES);
  createCanvas(windowWidth, windowHeight);
  createNonOverlappingCircle();
}

function draw() 
{
  background(220);
  for (const circle of circles)
    {
      circle.display();
    }
}

function windowResized()
{
  resizeCanvas(windowWidth,windowHeight);
  createNonOverlappingCircle(); //Call function to create more if number is not met.
}

function createNonOverlappingCircle() 
{
  for (let i = 0; i < numCircles; i++)  //Populating circles in to circles array
  {  
    console.log(i);
    let diameter = random(130, 200); //diameter of main circle
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
    // Draw main circle
    fill(this.circleColor);
    noStroke();
    circle(this.x, this.y, this.diameter);

    //Drawing the center disk
    for (let i = 0; i<8; i++)
      {
        stroke(0);
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
