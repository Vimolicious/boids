const boidWidth = 6;
const boidHeight = 10;

const maxSpeed = 4;
const maxForce = 0.1;
const fov = 60; // Fov radius
const halfFovAngle = 1.745329252; // Radians

const xOff = 0;
const yOff = 0;

class Boid {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D();
    // Changes the initial magnitude (speed) of the original velocity
    this.vel.setMag(random(0.5, 1.5));
    this.acc = createVector();

    this.boidsInView = [];
  }

  update() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.vel.limit(maxSpeed);
    this.acc.mult(0);
  }

  show() {
    strokeWeight(1);
    const rotateAngle = this.vel.heading();
    push();
    translate(this.pos.x, this.pos.y);
    rotate(rotateAngle);
    fill(255);
    noStroke();
    beginShape();
    vertex(-boidHeight / 2, -boidWidth / 2);
    vertex(boidHeight / 2, 0);
    vertex(-boidHeight / 2, boidWidth / 2);
    endShape(CLOSE);
    // Overlay
    if (keyIsPressed && key === 'p') {
      fill(255, 255, 255, 100);
      arc(0, 0, fov, fov, -halfFovAngle, halfFovAngle);
      stroke(255, 0, 0);
      push();
      rotate(-rotateAngle);
      line(0, 0, this.vel.x * 10, this.vel.y * 10);
      translate(-this.pos.x, -this.pos.y);
      stroke(0, 50);
      for (let boid of this.boidsInView) {
        line(this.pos.x, this.pos.y, boid.pos.x, boid.pos.y);
      }
      pop();
    }
    pop();
  }

  set otherBoids(boids) {
    this.boidsInView = [];
    for (let otherBoid of boids) {
      if (
        this != otherBoid &&
        dist(this.pos.x, this.pos.y, otherBoid.pos.x, otherBoid.pos.y) <= fov
      ) {
        const relativeAngle = Math.atan(
          (otherBoid.pos.y - this.pos.y) / (otherBoid.pos.x - this.pos.x)
        );

        this.boidsInView.push(otherBoid);

        // if (-halfFovAngle <= relativeAngle && relativeAngle <= halfFovAngle) {
        //   this.boidsInView.push(otherBoid);
        // } else {
        //   console.log(relativeAngle);
        // }
      }
    }
  }

  flock(boids) {
    this.otherBoids = boids;

    if (alignCheck.checked()) {
      const alignment = this.align(this.boidsInView);
      this.acc.add(alignment);
    }
    if (separateCheck.checked()) {
      const separation = this.separate(this.boidsInView);
      this.acc.add(separation);
    }
    if (cohereCheck.checked()) {
      const cohesion = this.cohere(this.boidsInView);
      this.acc.add(cohesion);
    }
  }

  /**
   * Find the average heading of the boids in this boid's view
   * @param {*} boidsInView
   */
  align(boidsInView) {
    // Find the average heading of the near boids
    let steering = boidsInView.reduce((sum, otherBoid) => {
      sum.add(otherBoid.vel);
      return sum;
    }, createVector()); // Initial value for steering

    if (boidsInView.length > 0) {
      //
      steering.div(boidsInView.length);

      // Reset the speed
      steering.setMag(maxSpeed);

      // desiredVel - currentVel = steeringForce
      steering.sub(this.vel);

      // Cap the magnitude of the average velocity
      steering.limit(maxForce);
    }

    return steering;
  }

  /**
   * Steer this boid away from other nearby boids
   * @param {*} boidsInView
   */
  separate(boidsInView) {
    // Go through each of the other boids
    let steering = boidsInView.reduce((steering, otherBoid) => {
      // Calculate the distance between this boid and the other boid
      const d = dist(this.pos.x, this.pos.y, otherBoid.pos.x, otherBoid.pos.y);
      // Add to the steering sum the vector distance divided by the linear distance squared. Why? I don't know
      steering.add(p5.Vector.sub(this.pos, otherBoid.pos).div(d * d));
      return steering;
    }, createVector()); // Initial value for steering

    if (boidsInView.length > 0) {
      steering.div(boidsInView.length);
      steering.setMag(maxSpeed);
      steering.sub(this.vel);
      steering.limit(maxForce);
    }

    return steering;
  }

  cohere(boidsInView) {
    let steering = boidsInView.reduce((steering, otherBoid) => {
      steering.add(otherBoid.pos);
      return steering;
    }, createVector());

    if (boidsInView.length > 0) {
      steering.div(boidsInView.length);
      // ?
      steering.sub(this.pos);
      steering.setMag(maxSpeed);
      steering.sub(this.vel);
      steering.limit(maxForce);
    }

    return steering;
  }

  wrapAround() {
    if (this.pos.x <= -xOff) {
      this.pos.x = width + xOff;
    } else if (this.pos.x >= width + xOff) {
      this.pos.x = -xOff;
    }

    if (this.pos.y <= -yOff) {
      this.pos.y = height + yOff;
    } else if (this.pos.y >= height + yOff) {
      this.pos.y = -yOff;
    }
  }
}
