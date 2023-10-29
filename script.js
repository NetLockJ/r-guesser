const graph = document.getElementById("graph");
const reveal = document.getElementById("reveal");
const pointsInput = document.getElementById("points-input");
const guessInput = document.getElementById("guess-input");

window.onload = function () {
  pointsInput.value = "10";
  numPoints = 10;
  generateRandomPoints();
};

pointsInput.addEventListener("input", (event) => {
  numPoints = pointsInput.value == "" ? 25 : pointsInput.value;
});

guessInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (!isNewData) {
      generateRandomPoints();
    } else {
      revealData();
    }
  }
});

// Global start set constants
var numPoints = pointsInput.value;
var coorelation = 1;
var isNewData = true;

var numGuesses = 0;
var avgDev = 0;

// Starting plot points
var plotPoints = {
  x: [3, 1, 2, 3, 4, 5, 6],
  y: [1, 9, 4, 7, 5, 2, 4],
  mode: "markers",
};

var data = [plotPoints];

var isMobile =
  window.innerHeight < 600 && window.innerWidth < 500 ? true : false;

var layout = {
  autosize: false,
  width: isMobile ? window.innerWidth * 0.85 : 600,
  height: isMobile ? window.innerHeight * 0.5 : 400,
  showlegend: false,
  autorange: true,

  margin: {
    l: 20,
    r: 0,
    b: 20,
    t: 0,
  },

  xaxis: {
    visible: true,
    showline: true,
    zeroline: false,
  },

  yaxis: {
    visible: true,
    showline: true,
    zeroline: false,
  },
};

const plot = Plotly.newPlot(graph, data, layout, { staticPlot: true });

// On button click, reveal real value
function revealData() {
  if (isNewData) {
    reveal.innerText = calculateR().toFixed(3);
    var guess = guessInput.value;

    updateAverageDev();

    if (Math.abs(guess - calculateR().toFixed(3)) < 0.1) {
      reveal.style.color = "green";
    } else {
      reveal.style.color = "red";
    }
  } else {
    reveal.style.color = "red";
    reveal.innerText = "Click Generate for a new Set!";
  }

  isNewData = false;
}

function generateRandomPoints() {
  if (numPoints <= 2000) {
    isNewData = true;
    plotPoints.x = [];
    plotPoints.y = [];

    var neg = Math.sign(Math.random() * 2 - 1);
    // 5000 is arbitrary, but works best with a fewer number of points
    dev = lerp(4, 7, numPoints / 2000);

    for (i = 0; i < numPoints; i++) {
      coors = boxMuller(lerp(0, 10, i / numPoints), dev);
      // Push random noise generated value to x
      plotPoints.x.push(Math.abs(coors[0]));
      // Push adjusted value to y, add 10 if is negative to keep axis numbers positive
      plotPoints.y.push(neg * lerp(0, 10, i / numPoints) + (neg < 0 ? 10 : 0));
    }

    reveal.style.color = "black";
    reveal.innerText = "???";

    updatePlot();
  } else {
    reveal.innerText =
      "Doing this many points won't yield a good result " +
      "and consume lots of RAM, I'd advise against it.";
  }
}

function updatePlot() {
  Plotly.update(graph, data, layout);
}

// linear interpolation between setpoints, a and b
function lerp(a, b, t) {
  return a + t * (b - a);
}

// Generate normal distrubution based on the Box-Muller Transform
function boxMuller(mean, stddev) {
  var u1, u2, R;
  do {
    u1 = Math.random() * 2 - 1;
    u2 = Math.random() * 2 - 1;
    R = u1 * u1 + u2 * u2;
    // Want on the closed interval from (0,1)
  } while (R > 1);
  var p1 = Math.sqrt((-2 * Math.log(R)) / R) * u1;
  var p2 = Math.sqrt((-2 * Math.log(R)) / R) * u2;
  return [mean + stddev * p1, mean + stddev * p2];
}

// Calculates the R value of the graph
function calculateR() {
  var sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXsq = 0,
    sumYsq = 0;

  for (i = 0; i < numPoints; i++) {
    y = plotPoints.y[i];
    x = plotPoints.x[i];

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXsq += x * x;
    sumYsq += y * y;
  }

  return (
    (numPoints * sumXY - sumX * sumY) /
    Math.sqrt(
      (numPoints * sumXsq - sumX * sumX) * (numPoints * sumYsq - sumY * sumY)
    )
  );
}

// Updates avg dev and progress bar
function updateAverageDev() {
  avgDev = (avgDev * numGuesses + Math.abs(calculateR().toFixed(3) - guessInput.value)) / (numGuesses + 1);
  numGuesses++;
  document.getElementById("progress-bar").setAttribute("x", Math.max(Math.min(198 - lerp(0, 198, avgDev), 198), 0) + "px");
  document.getElementById("average-dev").textContent = avgDev.toFixed(3) > 1 ? ">1.000" : avgDev.toFixed(3);
}
