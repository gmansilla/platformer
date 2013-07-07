var carGame = {

}
var canvas;
var ctx;
var canvasWidth;
var canvasHeight;

LEFT = 65;
RIGHT = 68;
JUMP = 87;
STEP_DISTANCE = 57000;
JUMP_ALTITUDE = 100000;
$(function() {
    $(document).keydown(function(e) {

        switch(e.keyCode) {
            case LEFT: // left - a
                if (isOnAir() && carGame.person.lastReleasedKey == LEFT && carGame.person.lastPressedKey == LEFT) {
                    break;
                }
                var impulse = new b2Vec2(STEP_DISTANCE * -1, 0);
                //carGame.person.ApplyImpulse(impulse, carGame.person.GetCenterPosition());
                carGame.person.SetLinearVelocity(new b2Vec2( -1 * STEP_DISTANCE / 100 ,0));
                carGame.person.lastPressedKey = LEFT;
                break;

            case RIGHT: // right - d
                if (isOnAir() && carGame.person.lastReleasedKey == RIGHT && carGame.person.lastPressedKey == RIGHT) {
                    break;
                }
                if (isOnAir()) {
                    
                } else {

                }
                var impulse = new b2Vec2(STEP_DISTANCE, 0);
                //carGame.person.ApplyImpulse(impulse, carGame.person.GetCenterPosition());
                carGame.person.SetLinearVelocity(new b2Vec2(STEP_DISTANCE / 100,0));
                carGame.person.lastPressedKey = RIGHT;
                break;

            case JUMP: //up - w
                carGame.person.lastPressedKey = JUMP;
                if (!isOnAir()) {
                    goDown(JUMP_ALTITUDE * -1);
                }
                break;
        }

    });

    $(document).keyup(function(e) {
        //console.log('key up ');
        carGame.person.lastReleasedKey = e.keyCode;
        carGame.person.SetLinearVelocity(new b2Vec2(0,0));
        carGame.person.SetAngularVelocity(0);
    });

    // create the world
    carGame.world = createWorld();
    // create the ground
    createGround(100, 25, 650, 470);
    createGround(250, 25, 250, 370);


    carGame.person = createPersonAt(50, 210);



    // get the reference of the context
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');
    canvasWidth = parseInt(canvas.width);
    canvasHeight = parseInt(canvas.height);
    // draw the world
    drawWorld(carGame.world, ctx);

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

    return carGame.world.CreateBody(boxBd);
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

function createGround(width, height, positionX, positionY) {
   /*
    // box shape definition
    var groundSd = new b2BoxDef();
    groundSd.extents.Set(250, 25);
    groundSd.restitution = 0;
    // body definition with the given shape we just created.
    var groundBd = new b2BodyDef();
    groundBd.AddShape(groundSd);
    groundBd.position.Set(250, 370);
    var body = carGame.world.CreateBody(groundBd);
    return body;
    */

    // box shape definition
    var groundSd = new b2BoxDef();
    groundSd.extents.Set(width, height);
    groundSd.restitution = 0;
    // body definition with the given shape we just created.
    var groundBd = new b2BodyDef();
    groundBd.AddShape(groundSd);
    groundBd.position.Set(positionX, positionY);
    var body = carGame.world.CreateBody(groundBd);
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
    carGame.world.Step(1.0/60, 1);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawWorld(carGame.world, ctx);
    setTimeout(step, 10);

}

function isOnAir() {
    for (var cn = carGame.world.GetContactList(); cn != null; cn = cn.GetNext()) {
        var body1 = cn.GetShape1().GetBody();
        var body2 = cn.GetShape2().GetBody();
        if (body1 == carGame.person || body2 == carGame.person) {
            return false;
        }

    }
    return true;
}

function goDown(magnitude) {
//console.log(magnitude);
    var impulse = new b2Vec2(0, magnitude);
    carGame.person.ApplyImpulse(impulse, carGame.person.GetCenterPosition());
    //carGame.person.SetLinearVelocity(new b2Vec2(0, -570));
    carGame.person.isJumping = true;
    //console.log(carGame.person.GetLinearVelocity());
}
