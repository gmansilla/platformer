var myGame = {

    STEP_DISTANCE: 18000,
    STEP_DISTANCE_ON_AIR: 25000,
    JUMP_ALTITUDE: 150000,
    lives: 3,
    time: 20000
}
var canvas;
var ctx;
var canvasWidth;
var canvasHeight;

LEFT = 65;
RIGHT = 68;
JUMP = 87;


$(function() {
    $(document).keydown(function(e) {
        var isFlying = isOnAir();
        switch(e.keyCode) {
            case LEFT: // left - a
                movePerson(LEFT, isFlying);
                break;

            case RIGHT: // right - d
                movePerson(RIGHT, isFlying);
                break;

            case JUMP: //up - w

                if (!isFlying) {
                    goDown(myGame.JUMP_ALTITUDE * -1); //negative, so we JUMP
                } else {
                    goDown(100000);
                }
                myGame.person.lastPressedKey = JUMP;
                break;
        }

    });

    $(document).keyup(function(e) {

        myGame.person.lastReleasedKey = e.keyCode;
        myGame.person.SetLinearVelocity(new b2Vec2(0, 0));
        myGame.person.SetAngularVelocity(0);
    });

    // create the world
    myGame.world = createWorld();
    // create the ground
    createGround(100, 10, 100, 250, 8); //goal
    createGround(80, 10, 400, 120, 7); //
    createGround(100, 10, 500, 220, 6); //
    createGround(80, 10, 760, 300, 5); //
    createGround(80, 10, 700, 410, 4); //
    createGround(99, 10, 980, 500, 3); //

    createGround(100, 10, 600, 520, 2); //

    createGround(90, 10, 750, 600, 1); //



    //createGround(width, height, positionX, positionY) {



    myGame.lava = createGround(800, 25, 550, 670);//base - lava
    myGame.person = createPersonAt(750, 500);
    //myGame.person = createPersonAt(350, 1010);



    // get the reference of the context
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');
    canvasWidth = parseInt(canvas.width);
    canvasHeight = parseInt(canvas.height);
    // draw the world
    drawWorld(myGame.world, ctx);

    // start advancing the step
    step();
});

function createPersonAt(x, y) {
    // create a box
    var boxSd = new b2BoxDef();
    boxSd.density = 0.1;
    boxSd.friction = 0;
    boxSd.restitution = 0;
    boxSd.extents.Set(20, 40);

    var boxBd = new b2BodyDef();
    boxBd.AddShape(boxSd);
    boxBd.position.Set(x, y);
    boxBd.preventRotation = true;

    return myGame.world.CreateBody(boxBd);
}

function createWorld() {
    // set the size of the world
    var worldAABB = new b2AABB();
    worldAABB.minVertex.Set(-4000, -4000);
    worldAABB.maxVertex.Set(4000, 4000);
    // Define the gravity
    var gravity = new b2Vec2(0, 300);
    // set to ignore sleeping object
    var doSleep = false;
    // finally create the world with the size, gravity, and sleep object parameter.
    var world = new b2World(worldAABB, gravity, doSleep);

    return world;
}

function createGround(width, height, positionX, positionY, index) {
    // box shape definition
    var groundSd = new b2BoxDef();
    groundSd.extents.Set(width, height);
    groundSd.restitution = 0;

    // body definition with the given shape we just created.
    var groundBd = new b2BodyDef();
    groundBd.AddShape(groundSd);
    groundBd.position.Set(positionX, positionY);
    groundBd.m_userData = index;
    var body = myGame.world.CreateBody(groundBd);
    return body;
}

// drawing functions
function drawWorld(world, context) {
    for (var b = world.m_bodyList; b != null; b = b.m_next) {
        for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
            drawShape(s, context);
        }
    }
}

// drawShape function directly copy from draw_world.js in Box2dJS library
function drawShape(shape, context) {
    context.strokeStyle = '#003300';
    context.beginPath();
    switch (shape.m_type) {
        case b2Shape.e_circleShape:
            var circle = shape;
            var pos = circle.m_position;
            var r = circle.m_radius;
            var segments = 16.0;
            var theta = 0.0;
            var dtheta = 2.0 * Math.PI / segments;
            // draw circle
            context.moveTo(pos.x + r, pos.y);
            for (var i = 0; i < segments; i++) {
                var d = new b2Vec2(r * Math.cos(theta),
                    r * Math.sin(theta));
                var v = b2Math.AddVV(pos, d);
                context.lineTo(v.x, v.y);
                theta += dtheta;
            }
            context.lineTo(pos.x + r, pos.y);
            // draw radius
            context.moveTo(pos.x, pos.y);
            var ax = circle.m_R.col1;
            var pos2 = new b2Vec2(pos.x + r * ax.x, pos.y + r * ax.y);
            context.lineTo(pos2.x, pos2.y);
            break;
        case b2Shape.e_polyShape:
            var poly = shape;
            var tV = b2Math.AddVV(poly.m_position,
                b2Math.b2MulMV(poly.m_R, poly.m_vertices[0]));
            context.moveTo(tV.x, tV.y);
            for (var i = 0; i < poly.m_vertexCount; i++) {
                var v = b2Math.AddVV(poly.m_position,
                    b2Math.b2MulMV(poly.m_R, poly.m_vertices[i]));
                context.lineTo(v.x, v.y);
            }
            context.lineTo(tV.x, tV.y);
    break;
    }
    context.stroke();
}

function step() {
    myGame.world.Step(1.0/60, 1);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawWorld(myGame.world, ctx);
    setTimeout(step, 20);
    for (var cn = myGame.world.GetContactList(); cn != null; cn = cn.GetNext()) {
        var body1 = cn.GetShape1().GetBody();
        var body2 = cn.GetShape2().GetBody();
        if (body1 == myGame.lava || body2 == myGame.lava) { //character is on lava,
            myGame.world.DestroyBody(myGame.person);
        }
    }
}

function movePerson(direction, isFlying) {
    myGame.person.currentStepDistance = (isFlying? myGame.STEP_DISTANCE_ON_AIR : myGame.STEP_DISTANCE);
    /*console.log("-------------------------------");
    console.log("flying: " + isFlying);
    console.log("direction: " + direction);
    console.log("released: " + myGame.person.lastReleasedKey);
    console.log("pressed: " + myGame.person.lastPressedKey);
    console.log("-------------------------------");*/

    //if (isFlying && (myGame.person.lastReleasedKey == direction && myGame.person.lastPressedKey == direction)) {
    if (isFlying && (myGame.person.lastPressedKey == direction)) {

        return;
    }
    if (direction == RIGHT) {
        var vector = new b2Vec2(myGame.person.currentStepDistance / 100,0);
    } else if (direction == LEFT) {
        var vector = new b2Vec2(myGame.person.currentStepDistance * -1 / 100,0);
    }
    myGame.person.SetLinearVelocity(vector);
    myGame.person.lastPressedKey = direction;
}

function isOnAir() {
    var x = Math.abs(myGame.person.GetLinearVelocity().x);
    var y = myGame.person.GetLinearVelocity().y;
    //console.log("/////");
    //console.log("X: " + x + " Y: " + y);
    //return !(x == 0 && y == 0 || (x == MyGame.STEP_DISTANCE / 100));
    if (myGame.person.currentStepDistance === undefined) {
        myGame.person.currentStepDistance = myGame.STEP_DISTANCE;
    }
    //console.log("step " + myGame.person.currentStepDistance);
    //console.log("/////");
    if (x == 0 && y == 0 || (x == myGame.person.currentStepDistance / 100 && y == 0)) {
        return false;
    } //else if () {
        return true;
    //}
}

function goDown(magnitude) {
    var impulse = new b2Vec2(0, magnitude);
    myGame.person.ApplyImpulse(impulse, myGame.person.GetCenterPosition());
}
