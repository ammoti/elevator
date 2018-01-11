
const DIRECTION_DOWN = -1;
const DIRECTION_NONE = 0;
const DIRECTION_UP = 1;
const FLOOR_COUNT = 10;

// Operation -1 means elevator isn't summoned for that floor.
// Operation 0 is neutral destination, stands for cabin button selection.
// Operation 1 is pickup destination for up direction.
// Operation 2 is pickup destination for down direction.
// Operation 3 is pickup destination for up both directions.
const OPERATION_NONE = -1
const OPERATION_NEUTRAL = 0 
const OPERATION_UP = 1
const OPERATION_DOWN = 2
const OPERATION_BOTH = 3

function HardwareElevator() {
    
    // Elevator is initialized in idle mode.
    this.direction = DIRECTION_NONE;
    // Elevator is initialized in floor 0.
    this.currentFloor = 0;
    // We define an array that holds operations for each floor
    
    this.floors = Array.apply(null, Array(FLOOR_COUNT)).map(Number.prototype.valueOf,-1);

    // Destination floor for the elevator
    this.destination = -1;

    this.summon = function(floor, direction = 0){
        var currentOperation = this.floors[floor];
        
        if(direction == DIRECTION_NONE && currentOperation == OPERATION_NONE) {
            // Button is pressed from cabin, neutral operation. If current operations direction is up or down, there is no change. Elevator is already stopping on that floor.

            if(this.direction == DIRECTION_DOWN && floor > this.destination) {
                this.floors[this.destination] = this.floors[this.destination] == OPERATION_UP ? OPERATION_BOTH : OPERATION_DOWN;
                this.destination = floor;
            }else if(this.direction == DIRECTION_UP && floor < this.destination) {
                this.floors[this.destination] = this.floors[this.destination] == OPERATION_DOWN ? OPERATION_BOTH : OPERATION_UP;
                this.destination = floor;
            }else{
                this.floors[floor] = OPERATION_NEUTRAL
            }


        }else if (direction == DIRECTION_UP) {

            if(this.direction == DIRECTION_UP && floor < this.destination) {
                this.floors[this.destination] = this.floors[this.destination] == OPERATION_DOWN ? OPERATION_BOTH : OPERATION_UP;
                this.destination = floor;
            }else {
                // Button is pressed from floor with up direction.
                if(currentOperation == OPERATION_NONE || currentOperation == OPERATION_NEUTRAL) {
                    this.floors[floor] = OPERATION_UP
                }else if (currentOperation == OPERATION_DOWN) {
                    this.floors[floor] = OPERATION_BOTH
                }
            }

        }else if (direction == DIRECTION_DOWN) {

            if(this.direction == DIRECTION_DOWN && floor > this.destination) {
                this.floors[this.destination] = this.floors[this.destination] == OPERATION_UP ? OPERATION_BOTH : OPERATION_DOWN;
                this.destination = floor;
            }else{
                // Button is pressed from floor with up direction.
                if(currentOperation == OPERATION_NONE || currentOperation == OPERATION_NEUTRAL) {
                    this.floors[floor] = OPERATION_DOWN
                }else if (currentOperation == OPERATION_UP) {
                    this.floors[floor] = OPERATION_BOTH
                }

            }
        }

    }

    this.nextDestination = function(direction) {

        if(direction == DIRECTION_DOWN) {

            for (let index = this.currentFloor - 1; index >= 0; index--) {
                var floorOperation = this.floors[index];

                // 0 : Neutral operation. Someone will get off of the elevator.
                // 2 : Someone that is going up will get in the elevator.
                if(floorOperation == OPERATION_NEUTRAL || floorOperation == OPERATION_DOWN) {
                    // Found next destination. Since elevator will move to this floor, this floor is no longer a destination for down direction.
                    this.floors[index] = -1
                    this.destination = index
                    return index
                }else if(floorOperation == OPERATION_BOTH) {
                    // Found next destination. Since elevator will move to this floor, this floor is no longer a destination for down direction. Since the operation was for both directions, this floor is still a destination for up direction.
                    this.floors[index] = OPERATION_UP
                    this.destination = index
                    return index
                }
            }
            
        }else if(direction == DIRECTION_UP) {

            for (let index = this.currentFloor + 1; index < FLOOR_COUNT; index++) {
                var floorOperation = this.floors[index];

                // 0 : Neutral operation. Someone will get off of the elevator.
                // 1 : Someone that is going up will get in the elevator.
                if(floorOperation == OPERATION_NEUTRAL ||floorOperation == OPERATION_UP) {
                    // Found next destination. Since elevator will move to this floor, this floor is no longer a destination for up direction.
                    this.floors[index] = OPERATION_NONE
                    this.destination = index
                    return index
                }else if(floorOperation == OPERATION_BOTH) {
                    // Found next destination. Since elevator will move to this floor, this floor is no longer a destination for up direction. Since the operation was for both directions, this floor is still a destination for down direction.
                    this.floors[index] = OPERATION_DOWN
                    this.destination = index
                    return index
                }
            }

        }
        
        // Could not find destination in given direction.
        return -1;
    }
    
    this.findDestination = function() {
        //var direction = this.direction == DIRECTION_NONE ? DIRECTION_UP : this.direction;
        // Seeking for next destination in current direction.
        var found = this.nextDestination(this.direction);

        if(found > 0) {
            return found;
        }
        // Destination in current direction is not found, seeking for floor in opposite direction.
        found = this.nextDestination(-this.direction);

        if(found > 0) {
            // Found destination in opposite direction. Changing direction.
            this.direction = -this.direction;
            return found;
        }

        // There is no destination in both directions. Getting in idle mode.
        this.direction = DIRECTION_NONE;
        this.destination = -1;
    }
};

HardwareElevator.prototype = {
   // Do not implement this!!
   moveUp: function () {
    console.log('moving up');
    var hardware = this;
    var target = $("#elevator").position().top - 50;
    $("#elevator").animate({ top: target }, 500, "linear", function() {
        hardware.currentFloor = hardware.currentFloor + 1;
        elevator.onBeforeFloor(hardware.currentFloor, hardware.direction);
    })

   },
   moveDown: function () {
    console.log('moving down'); 
    
    var hardware = this;
    var target = $("#elevator").position().top + 50;

    $("#elevator").animate({ top: target }, 500, "linear", function() {
        hardware.currentFloor = hardware.currentFloor - 1;
        elevator.onBeforeFloor(hardware.currentFloor, hardware.direction);
    })
      
   },
   stopAndOpenDoors: function () {
      console.log('stopping and opening doors');
      $("#elevator").animate( { backgroundColor: "#CCC" }, 300, function(){
        $("#elevator").css("background-color", "rgba(0, 0, 255, 0.2);")
      });
   },
   getCurrentFloor: function () {
      console.log('getting current floor');
   },
   getCurrentDirection: function () {
      console.log('getting current drection');
   }
};

function Elevator() {
    this.hw = new HardwareElevator();

};

Elevator.prototype = {
    onDoorsClosed: function (floor) {
        // Your code here
        var destination = this.hw.findDestination();
        if(this.hw.direction == DIRECTION_UP) {
            this.hw.moveUp(destination);
        }else if(this.hw.direction == DIRECTION_DOWN) {
            this.hw.moveDown(destination);
        }
        // else elevator is in idle mode.
    },

    onBeforeFloor: function (floor, direction) {
        // Your code here
      console.log(floor + ' ' + direction);
      if(this.hw.destination == floor && this.hw.direction == direction) {
            this.hw.stopAndOpenDoors();
            this.onDoorsClosed(floor);
        }else {
            if(this.hw.direction == DIRECTION_UP) {
                this.hw.moveUp(floor);
            }else if(this.hw.direction == DIRECTION_DOWN) {
                this.hw.moveDown(floor);
            }
        }
    },

    floorButtonPressed: function (floor, direction) {
        // Your code here
        if(this.hw.currentFloor == floor) {
            return;
        }

        if(this.hw.direction == DIRECTION_NONE) {
            this.hw.destination = floor;
            this.hw.direction =  floor > this.hw.currentFloor ? DIRECTION_UP : DIRECTION_DOWN;
            if(this.hw.direction == DIRECTION_UP) {
                this.hw.moveUp(floor);
            }else if(this.hw.direction == DIRECTION_DOWN) {
                this.hw.moveDown(floor);
            }
            return;
        }

        this.hw.summon(floor, direction);
    },

    cabinButtonPressed: function (floor) {
        // Your code here
        if(this.hw.currentFloor == floor) {
            return;
        }

        if(this.hw.direction == DIRECTION_NONE) {
            this.hw.destination = floor;
            this.hw.direction =  floor > this.hw.currentFloor ? DIRECTION_UP : DIRECTION_DOWN;
            if(this.hw.direction == DIRECTION_UP) {
                this.hw.moveUp(floor);
            }else if(this.hw.direction == DIRECTION_DOWN) {
                this.hw.moveDown(floor);
            }
            return;
        }

        this.hw.summon(floor);
    }
};

function renderButtons(elevator) {
    
        var floorList = $('<div>floors</div>');
        for (let index = FLOOR_COUNT-1; index >= 0; index--) {
             
            var listItem = $('<div class="button-container"><div class="button">'+ index +'<div></div>');

            var callForDownDirection = $('<div class="button">Down</div>');
            listItem.append(callForDownDirection);
            callForDownDirection.click(function() {
                elevator.floorButtonPressed(index, DIRECTION_DOWN);
            })

            var callFromCabin = $('<div class="button">Cabin</div>');
            listItem.append(callFromCabin);
            callFromCabin.click(function() {
                elevator.cabinButtonPressed(index);
            })

            var callForUpDirection = $('<div class="button">Up</div>');
            listItem.append(callForUpDirection);
            callForUpDirection.click(function() {
                elevator.floorButtonPressed(index, DIRECTION_UP);
            })

            listItem.append($('<div style="clear:both"></div>'));
            floorList.append(listItem);
            
        } 
        $("#floor-container").append(floorList);
    }
    function renderElevator(elevator) {
    
        var floorList = $('<div>floors</div>');
        for (let index = FLOOR_COUNT-1; index >= 0; index--) {
             
            var listItem = $('<div class="floor"><div>'+ index+ +'<div></div>');
           
            floorList.append(listItem);
            
        } 
        $("#elevator-container").append(floorList);
    }
    var elevator = new Elevator();
$(document).ready(function(){
    renderButtons(elevator);
    renderElevator(elevator);
});

