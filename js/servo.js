var IOBoard = BO.IOBoard;
var IOBoardEvent = BO.IOBoardEvent;
var Servo = BO.io.Servo;
var Potentiometer = BO.io.Potentiometer;
var PotEvent = BO.io.PotEvent;

var LED = BO.io.LED;
var Pin = BO.io.Pin;

var Pin = BO.Pin;
var PinEvent = BO.PinEvent;

var servoReadings = 20;
var servoVals = [];

// Set to true to print debug messages to console
BO.enableDebugging = true;

// If you are not serving this file from the same computer
// that the Arduino board is connected to, replace
// location.hostname with the IP address or hostname
// of the computer that the Arduino board is connected to.
var arduino = new IOBoard("localhost", 8887);

// Variables
var servo;
var red;
var green;
var blue;
var gate;

var servoIn, servoOut = 0;
var feedingInitiated = false;

var breatheInterval;

$(document).ready(function() {
	// Listen for the IOBoard READY event which indicates the IOBoard
	// is ready to send and receive data
	arduino.addEventListener(IOBoardEvent.READY, onReady);
});

function onReady(event) {
	// Remove the listener because it is no longer needed
	arduino.removeEventListener(IOBoardEvent.READY, onReady);

	//set up the light gate sensor
	arduino.setDigitalPinMode(4, Pin.DIN);
	gate = arduino.getDigitalPin(4);
	gate.addEventListener(PinEvent.CHANGE, onLightGateChange);

	// Parameters: board, pin
	servo = new Servo(arduino, arduino.getDigitalPin(9));
	servo.angle = 180;//0 degrees is extended, 180 is retracted. go in, get a cookie
	$(servo).bind('Servo.OUT', onServoOut);
	$(servo).bind('Servo.IN', onServoIn);
	$(servo).bind('Servo.DONE', onServoDone);

	red = new LED(arduino, arduino.getDigitalPin(6));
	green = new LED(arduino, arduino.getDigitalPin(5));
	blue = new LED(arduino, arduino.getDigitalPin(3));

	arduinoIsReady = true;

	makeBreatheInterval();//gotta run this once in a while. the clock is shit
}

function makeBreatheInterval(){
	red.stopBlinking();
	green.stopBlinking();
	blue.stopBlinking();

	red.blink(1000, 0, BO.generators.Oscillator.BREATHERED);
	green.blink(1000, 0, BO.generators.Oscillator.BREATHEGREEN);
	blue.blink(1000, 0, BO.generators.Oscillator.BREATHEBLUE);
}

function onServoIn(){
	console.log('in');

	if(feedingInitiated){
		console.log('extending to complete feeding');
		servo.angle=180;
		setTimeout( function(){$(servo).trigger('Servo.OUT');}, 5000 );
	}
}

function onServoOut(){
	console.log('out');

	if(feedingInitiated){
		$(servo).trigger('Servo.DONE');
	}
}

function onServoDone(){
	feedingInitiated = false;
}

function onLightGateChange(event) {
	//console.log("pin value = " + gate.value);
	if(gate.value==0){
		makeBreatheInterval();
	}
}

//change servo angle (0-180): servo.angle
function feedUser(user){
	if(gate.value == 1){//only feed the user if
		console.log('feeding user '+user.from_user);
		fed_users.push(user);
		feedingInitiated = true;
		servo.angle = 0;//initiate the feeding, push the cookie 
		setTimeout(function(){$(servo).trigger('Servo.IN');}, 5000 );
	}else{
		console.log("cookie in the way");
	}
}

function denyUser(){
	//stop blinking
	red.stopBlinking();
	green.stopBlinking();
	blue.stopBlinking();	

	//turn off irrelevant colors
	green.off();
	blue.off();
	//blink red for 3000ms
	red.blink(300, 10, BO.generators.Oscillator.TRIANGLE);

	setTimeout(function(){makeBreatheInterval()},3500);	
}
/*BO.generators.Oscillator.BREATHE = function(val, lastVal) {
	return ((-240*Math.abs(Math.sin(val)))+255)/255; //breathe wave
};*/

BO.generators.Oscillator.BREATHERED = function(val, lastVal) {
	return (((-240*Math.abs(Math.sin(val)))+255)/255)*0.35; //breathe wave
};

BO.generators.Oscillator.BREATHEGREEN = function(val, lastVal) {
	return ((-240*Math.abs(Math.sin(val)))+255)/255; //breathe wave
};

BO.generators.Oscillator.BREATHEBLUE = function(val, lastVal) {
	return (((-240*Math.abs(Math.sin(val)))+255)/255)*0.4; //breathe wave
};