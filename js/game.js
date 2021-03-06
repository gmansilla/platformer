/*
JS FILE. Platformer Game
by Guillermo Mansilla.
This code is part of an assignment for Web Game Programming.
I am using 3rd party libraries like: Jquery, Box2D, Jquery-UI, Bootstrap and Jquery-FlipCounter
 */
var myGame = {
	STEP_DISTANCE: 58000,
	STEP_DISTANCE_ON_AIR: 35000,
	JUMP_ALTITUDE: 200000,
	LIVES: 3,
	MOVE_POINTS: 10,
	TIME_FRAME: 5,
	TIME_COST: 25,
	INITIAL_SCORE: 999,
	score: 0,
	currentLevel: 0,
	lives: 3,
	levels: [],
	startTime: 0,
	lastUpdate: 0,
	elapsedTime: 0
}

var canvas;
var ctx;
var canvasWidth;
var canvasHeight;

LEFT = 65;
RIGHT = 68;
JUMP = 87;

myGame.levels[0] = [
	{ "type": "person", "x": 750, "y": 500 },
	{ "type": "win", "width": 40, "height": 30, "x": 100, "y": 200, "rotation": 0, "friction": 0},
	{ "type": "platform", "width": 100, "height": 10, "x": 100, "y": 250, "rotation": 0, "friction": 0},
	{ "type": "platform", "width": 80, "height": 10, "x": 400, "y": 120, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 100, "height": 10, "x": 500, "y": 220, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 80, "height": 10, "x": 760, "y": 300, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 80, "height": 10, "x": 700, "y": 410, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 99, "height": 10, "x": 980, "y": 500, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 100, "height": 10, "x": 600, "y": 520, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 90, "height": 10, "x": 750, "y": 600, "rotation": 0, "friction": 0 }
];

myGame.levels[1] = [
	{ "type": "person", "x": 780, "y": 500 },
	{ "type": "win", "width": 40, "height": 30, "x": 100, "y": 200, "rotation": 0, "friction": 0},
	{ "type": "platform", "width": 80, "height": 10, "x": 100, "y": 250, "rotation": 0, "friction": 0},
	{ "type": "platform", "width": 80, "height": 10, "x": 350, "y": 300, "rotation": -20, "friction": 0.1 },
	{ "type": "platform", "width": 50, "height": 10, "x": 550, "y": 350, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 80, "height": 10, "x": 760, "y": 230, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 80, "height": 10, "x": 720, "y": 410, "rotation": 10, "friction": 0 },
	{ "type": "platform", "width": 99, "height": 10, "x": 980, "y": 500, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 30, "height": 10, "x": 300, "y": 450, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 30, "height": 10, "x": 400, "y": 500, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 30, "height": 10, "x": 520, "y": 550, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 30, "height": 10, "x": 620, "y": 590, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 40, "height": 10, "x": 800, "y": 600, "rotation": 0, "friction": 0 }
];
myGame.levels[2] = [
	{ "type": "person", "x": 420, "y": 50 },
	{ "type": "win", "width": 20, "height": 30, "x": 950, "y": 200, "rotation": 0, "friction": 0},
	{ "type": "platform", "width": 100, "height": 10, "x": 900, "y": 250, "rotation": 0, "friction": 0},
	{ "type": "platform", "width": 80, "height": 10, "x": 400, "y": 120, "rotation": -20, "friction": 0 },
	{ "type": "platform", "width": 80, "height": 10, "x": 130, "y": 400, "rotation": 20, "friction": 0 },
	{ "type": "platform", "width": 40, "height": 10, "x": 680, "y": 300, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 50, "height": 10, "x": 350, "y": 500, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 80, "height": 10, "x": 570, "y": 420, "rotation": 0, "friction": 0 },
	{ "type": "platform", "width": 30, "height": 10, "x": 600, "y": 50, "rotation": -40, "friction": 0 }
];


$(function () {
	$("#showBoard").click(function () {
		$("#welcome").hide("slide", { direction: "down" }, 100);
		$("#wrap").show();
		// get the reference of the context
		canvas = document.getElementById('game');
		ctx = canvas.getContext('2d');
		canvasWidth = parseInt(canvas.width);
		canvasHeight = parseInt(canvas.height);
        $("#counterTime").flipCounter({
			imagePath: "images/flipCounter-medium.png"
		});
		myGame.score = myGame.INITIAL_SCORE;
		$("#counterTime").flipCounter("setNumber", 0);
		$("#counterScore").flipCounter({
			imagePath: "images/flipCounter-medium.png",
			numIntegralDigits: 3
		});
		$("#counterScore").flipCounter("setNumber", myGame.score);

		$("#counterLives").flipCounter({
			imagePath: "images/flipCounter-medium.png"
		});
		$("#counterLives").flipCounter("setNumber", myGame.lives);
		$("#counterLevels").flipCounter({
			imagePath: "images/flipCounter-medium.png"
		});
		$("#counterLevels").flipCounter("setNumber", myGame.levels.length - myGame.currentLevel);

		restartGame(myGame.currentLevel);
		drawWorld(myGame.world, ctx);
		var currentTime = new Date();
		myGame.lastUpdate = myGame.startTime = currentTime.getTime();
		$(document).keydown(function (e) {
			var isFlying = isOnAir();
			switch (e.keyCode) {
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

		$(document).keyup(function (e) {
			myGame.person.lastReleasedKey = e.keyCode;
			myGame.person.SetLinearVelocity(new b2Vec2(0, 500));
			myGame.person.SetAngularVelocity(0);
		});
		step();
	});


});

/**
 * initializes the given level
 * @param level
 * @return void
 */
function restartGame(level) {
	myGame.currentLevel = level;
	myGame.world = createWorld();
	myGame.lava = createGround(1500, 25, 0, canvasHeight + 200, 0, 0); //base - lava, if avatar touches this, then it dies
    for (var i = 0; i < myGame.levels[level].length; i++) {
		var obj = myGame.levels[level][i];
        if (obj.type == "platform") {
			createGround(obj.width, obj.height, obj.x, obj.y, obj.rotation, obj.friction);
		} else if (obj.type == "person") {
			myGame.person = createPersonAt(obj.x, obj.y);
		} else if (obj.type == "win") {
			myGame.win = createGround(obj.width, obj.height, obj.x, obj.y, obj.rotation, obj.friction, true);
		}
	}
	$("#counterLevels").flipCounter("setNumber", myGame.levels.length - myGame.currentLevel);
	$("#audio-background")[0].play();
}

/**
 * Creates the avatar at a given position
 * @param x desired position in X coordinates
 * @param y desired position in Y coordinates
 * @returns {*}
 */
function createPersonAt(x, y) {
	// create a box
	var boxSd = new b2BoxDef();
	boxSd.density = 0.1;
	boxSd.friction = 0;
	boxSd.restitution = 0;
	boxSd.extents.Set(33, 42);
	boxSd.userData = document.getElementById('person');
	var boxBd = new b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(x, y);
	boxBd.preventRotation = true;

	return myGame.world.CreateBody(boxBd);
}

/**
 * Creates the world
 * @returns {b2World}
 */
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

/**
 * Creates a platform
 * @param int width desired width
 * @param int height desired height
 * @param int positionX desired position in X coordinates
 * @param int positionY desired position in Y coordinates
 * @param int rotation rotation to be used
 * @param int friction friction to be used in the fixture
 * @param boolean image
 * @returns {*}
 */
function createGround(width, height, positionX, positionY, rotation, friction, image) {
	// box shape definition
	var groundSd = new b2BoxDef();
	groundSd.extents.Set(width, height);
	groundSd.restitution = 0;
	groundSd.friction = friction;
	if (image === true) {
		groundSd.userData = document.getElementById('win');
	}

	// body definition with the given shape we just created.
	var groundBd = new b2BodyDef();
	groundBd.AddShape(groundSd);

	groundBd.position.Set(positionX, positionY);
	groundBd.rotation = rotation * Math.PI / 180;
	var body = myGame.world.CreateBody(groundBd);
	return body;
}

/**
 * Draws the world
 * @param world
 * @param context
 */
function drawWorld(world, context) {
	for (var b = world.m_bodyList; b != null; b = b.m_next) {
		for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
			if (s.GetUserData() != undefined) {
				// the user data contains the reference to the image
				var img = s.GetUserData();
				// the x and y of the image.
				// We have to substract the half width/height
				var x = s.GetPosition().x;
				var y = s.GetPosition().y;
				var topleftX = -$(img).width() / 2;
				var topleftY = -$(img).height() / 2;
				context.save();
				context.translate(x, y);
				context.rotate(s.GetBody().GetRotation());
				context.drawImage(img, topleftX, topleftY);
				context.restore();
			}
			else {
				drawShape(s, context);
			}
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

/**
 * Step function, most of the logic is handled here.
 * We constantly check the collisions events and check if game is over or
 * if user passes to the next level
 */
function step() {
	myGame.world.Step(1.0 / 60, 1);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	drawWorld(myGame.world, ctx);
	setTimeout(step, 20);

	var currentTime = new Date();
	currentTime = currentTime.getTime();
	if ((currentTime - myGame.lastUpdate) > 1000) {
		$("#counterTime").flipCounter("setNumber", ++myGame.elapsedTime);
		myGame.lastUpdate = currentTime;
		if (!(myGame.elapsedTime % myGame.TIME_FRAME)) {
			myGame.score -= myGame.TIME_COST;

		}
		$("#counterScore").flipCounter("setNumber", myGame.score);
		if (myGame.score < 1) {
			$("#counterScore").flipCounter("setNumber", 0);
			$("#audio-background")[0].pause();
			$("#audio-game-over")[0].play();
            alert("Game Over. Either you made too much moves or you ran out of time");
            gameOver();
		}
    }
    for (var cn = myGame.world.GetContactList(); cn != null; cn = cn.GetNext()) {
		var body1 = cn.GetShape1().GetBody();
		var body2 = cn.GetShape2().GetBody();
    	if (body1 == myGame.lava || body2 == myGame.lava) { //character is on lava,
			myGame.world.DestroyBody(myGame.person);
    		if (myGame.lives == 0) {
				$("#audio-background")[0].pause();
				$("#audio-game-over")[0].play();
				alert("Game Over");
				gameOver();
			} else {
				$("#audio-lose")[0].play();
				myGame.lives--;
				alert("you failed! lets try again");
				$("#counterLives").flipCounter("setNumber", myGame.lives);
				$("#counterLevels").flipCounter("setNumber", myGame.levels.length - myGame.currentLevel);
				restartGame(myGame.currentLevel);
			}
		} else if ((body1 == myGame.person && body2 == myGame.win) ||
			(body1 == myGame.win && body2 == myGame.person)) {
			var totalLevels = myGame.levels.length;
			myGame.currentLevel++;
			if (myGame.currentLevel == totalLevels) {
				$("#audio-background")[0].pause();
				$("#audio-win")[0].play();
				alert("You have won the game");
				gameOver();
				restartGame(0);
			} else if (myGame.currentLevel < totalLevels) {
				$("#audio-background")[0].pause();
				$("#audio-pass-level")[0].play();
				alert("You have passed to the next level");
				restartGame(myGame.currentLevel);
			}
		}
	}
}

/**
 * Resets the game to the initial state
 */
function gameOver() {
	myGame.currentLevel = myGame.lastUpdate = myGame.elapsedTime = 0;
	myGame.score = myGame.INITIAL_SCORE;
	myGame.lives = myGame.LIVES;
	$("#counterTime").flipCounter("setNumber", myGame.elapsedTime);
	$("#counterScore").flipCounter("setNumber", myGame.score);
	$("#counterLives").flipCounter("setNumber", myGame.lives);
	$("#counterLevels").flipCounter("setNumber", myGame.levels.length - myGame.currentLevel);
	$("#audio-background")[0].currentTime = 0;
    restartGame(0);
}

/**
 * Moves the avatar to the given direction
 * @param int direction where the avatar should go
 * @param isFlying boolean indicating if avatar is not touching a platform (is flying)
 */
function movePerson(direction, isFlying) {
	myGame.person.currentStepDistance = (isFlying ? myGame.STEP_DISTANCE_ON_AIR : myGame.STEP_DISTANCE);
	if (isFlying && (myGame.person.lastPressedKey == direction)) {
		return;
	}
	if (direction == RIGHT) {
		var vector = new b2Vec2(myGame.person.currentStepDistance / 100, 0);
	} else if (direction == LEFT) {
		var vector = new b2Vec2(myGame.person.currentStepDistance * -1 / 100, 0);
	}
	myGame.score -= myGame.MOVE_POINTS;
	$("#counterScore").flipCounter("setNumber", myGame.score);
	myGame.person.SetLinearVelocity(vector);
	myGame.person.lastPressedKey = direction;
}

/**
 * Determines if the avatar is touching a platform
 * @returns {boolean}
 */
function isOnAir() {
	var x = Math.abs(myGame.person.GetLinearVelocity().x);
	var y = myGame.person.GetLinearVelocity().y;
	var list = myGame.world.GetContactList();
	return (list == null);
}

/**
 * Forces the avatar to go down
 * @param magnitude
 */
function goDown(magnitude) {
	var impulse = new b2Vec2(0, magnitude);
	myGame.person.ApplyImpulse(impulse, myGame.person.GetCenterPosition());
}
