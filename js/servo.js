var IOBoard = BO.IOBoard;
var IOBoardEvent = BO.IOBoardEvent;
var Servo = BO.io.Servo;
var Potentiometer = BO.io.Potentiometer;
var PotEvent = BO.io.PotEvent;

var LED = BO.io.LED;

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

var servoIn, servoOut = 0;
var feedingInitiated = false;

$(document).ready(function() {
	// Listen for the IOBoard READY event which indicates the IOBoard
	// is ready to send and receive data
	arduino.addEventListener(IOBoardEvent.READY, onReady);
});

function onReady(event) {

	// Remove the listener because it is no longer needed
	arduino.removeEventListener(IOBoardEvent.READY, onReady);

	// Analog input example using Potentiometer object
	// Parameters: board, analogPin, enableSmoothing		
	arduino.setDigitalPinMode(5, Pin.PWM);
	arduino.setDigitalPinMode(6, Pin.PWM);

	// Parameters: board, pin
	servo = new Servo(arduino, arduino.getDigitalPin(9));
	servo.angle = 180;//0 degrees is extended, 180 is retracted. go in, get a cookie
	$(servo).bind('Servo.OUT', onServoOut);
	$(servo).bind('Servo.IN', onServoIn);
	$(servo).bind('Servo.DONE', onServoDone);

	//white = new LED(arduino, arduino.getDigitalPin(5));
	//red = new LED(arduino, arduino.getDigitalPin(6));

	arduinoIsReady = true;
}

/*
function onServoChange(event){
	// The potentiometer gives back a value between <5 (in) and >18 (out)
	var valueIn = event.target.value;
	var value = valueIn * 100;
	value = value.toFixed(0);

	servoVals.push(value);
	if(servoVals.length >= servoReadings){
		servoVals.push(value);

		servoVals.splice(0,servoReadings);
		var t = 0;
		$.each(servoVals, function(i, val){
			t += val;
		});
		value = t/servoVals.length;

		//logic bloc for determining approximate progress of the servo
		if(value < 6){
			servoIn++;
			servoOut = 0;
			if(servoIn >=3){
				$(servo).trigger('Servo.IN');
				servo.status = "in";
				console.log('in');
			}
		}
		if(value > 32){
			servoOut++;
			servoIn = 0;
			if(servoOut > 3){
				$(servo).trigger('Servo.OUT');
				servo.status = "out";
				console.log('out');
			}
		}
	}
}
*/

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

//change servo angle (0-180): servo.angle
function feedUser(user){
	console.log('feeding user '+user.from_user);
	//fed_users.push(user);
	feedingInitiated = true;

	servo.angle = 0;//initiate the feeding, push the cookie 

	setTimeout(function(){$(servo).trigger('Servo.IN');}, 5000 );
}

BO.generators.Oscillator.BREATHE = function(val, lastVal) {
	return ((-240*Math.abs(Math.sin(val)))+255)/255; //breathe wave
};