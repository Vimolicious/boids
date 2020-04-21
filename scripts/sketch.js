const boids = [];
let alignCheck, separateCheck, cohereCheck;
let playPauseButton, simulating;

function setup() {
  const c = createCanvas(innerWidth, innerHeight);
  c.parent('canvas-container');

  for (let i = 0; i < 200; i++) {
    boids.push(new Boid());
  }

  alignCheck = createCheckbox('Alignment', true);
  separateCheck = createCheckbox('Separation', true);
  cohereCheck = createCheckbox('Cohesive', true);

  alignCheck.parent('controls');
  separateCheck.parent('controls');
  cohereCheck.parent('controls');

  simulating = true;
  playPauseButton = createButton('⏯');
  playPauseButton.mousePressed(() => {
    simulating = !simulating;
  });
  playPauseButton.parent('controls');
}

function draw() {
  background(16, 22, 31);

  for (let boid of boids) {
    if (simulating) {
      boid.update();
    }
    boid.show();

    boid.flock(boids);

    boid.wrapAround();
  }
}
