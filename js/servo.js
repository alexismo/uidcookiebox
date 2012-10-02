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
var white;
var red;
var servoIn, servoOut = 0;
var feedingInitiated = false;

$(document).ready(function() {
	// Listen for the IOBoard READY event which indicates the IOBoard
	// is ready to send and receive data
	if(arduino.isReady){
		arduino.addEventListener(IOBoardEvent.READY, onReady);
	}
});

function onReady(event) {
	//require the Arduino to be ready before any tweets are gotten
	setTimeout(function(){getTweetsForTag(hashtag)}, interval);

	// Remove the listener because it is no longer needed
	arduino.removeEventListener(IOBoardEvent.READY, onReady);

	// Analog input example using Potentiometer object
	// Parameters: board, analogPin, enableSmoothing		
	arduino.setDigitalPinMode(5, Pin.PWM);
	arduino.setDigitalPinMode(6, Pin.PWM);

	// Parameters: board, pin
	servo = new Servo(arduino, arduino.getDigitalPin(9));
	servo.angle = 45;//45 degrees is retracted, 90 is extended
	$(servo).bind('Servo.OUT', onServoOut);
	$(servo).bind('Servo.IN', onServoIn);
	$(servo).bind('Servo.DONE', onServoDone);

	white = new LED(arduino, arduino.getDigitalPin(5));
	red = new LED(arduino, arduino.getDigitalPin(6));

	// Enable the analog pin so we can read its value
	arduino.enableAnalogPin(1);
	var sensor = arduino.getAnalogPin(1);
	sensor.addEventListener(PinEvent.CHANGE, onServoChange);

	arduinoIsReady = true;

	setInterval(function(){//getting tweets every 3 seconds
        white.blink(interval, 3, BO.generators.Oscillator.BREATHE);
    }, interval);
}

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
		//console.log(value);

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

function onServoIn(){
	console.log('in');

	if(feedingInitiated){
		$(servo).trigger('Servo.DONE');
	}
}

function onServoOut(){
	console.log('out');

	if(feedingInitiated){
		console.log('going back to complete feeding');
		servo.angle=45;
	}
}

function onServoDone(){
		feedingInitiated = false;
		setTimeout(function(){getTweetsForTag(hashtag)}, interval);
}

//change servo angle (0-180...45-90): servo.angle
function feedUser(user){
	console.log('feeding user '+user.from_user);
	feedingInitiated = true;
	servo.angle = 90;//initiate the feeding
}

BO.generators.Oscillator.BREATHE = function(val, lastVal) {
	return ((-240*Math.abs(Math.sin(val)))+255)/255; //breathe wave
};