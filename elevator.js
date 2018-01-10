
const DIRECTION_DOWN = -1;
const DIRECTION_NONE = 0;
const DIRECTION_UP = 1;
const FLOOR_COUNT = 10;
// Operation -1 means elevator isn't summoned for that floor.
// Operation 0 is neutral destination, stands for cabin button selection.
// Operation 1 is pickup destination for up direction.
// Operation 2 is pickup destination for down direction.
// Operation 3 is pickup destination for up both directions.
const OPERATION_NONE = -1;
const OPERATION_NEUTRAL = 0;
const OPERATION_UP = 1;
const OPERATION_DOWN = 2;
const OPERATION_BOTH = 3;
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
            this.floors[floor] = OPERATION_NEUTRAL
        }else if (direction == DIRECTION_UP) {
            // Button is pressed from floor with up direction.
            if(currentOperation == OPERATION_NONE || currentOperation == OPERATION_NEUTRAL) {
                this.floors[floor] = OPERATION_UP;
            }else if (currentOperation == OPERATION_DOWN) {
                this.floors[floor] = OPERATION_BOTH;
            }
        }else if (direction == DIRECTION_DOWN) {
            // Button is pressed from floor with up direction.
            if(currentOperation == OPERATION_NONE || currentOperation == OPERATION_NEUTRAL) {
                this.floors[floor] = OPERATION_DOWN;
            }else if (currentOperation == OPERATION_UP) {
                this.floors[floor] = OPERATION_BOTH;
            }
        }
    }
    this.nextDestination = function(direction) {
        if(direction == DIRECTION_DOWN) {
            for (let index = this.currentFloor; index >= 0; index--) {
                var operation = floors[index];
                // 0 : Neutral operation. Someone will get off of the elevator.
                // 2 : Someone that is going up will get in the elevator.
                if(operation == OPERATION_NEUTRAL || operation == OPERATION_DOWN) {
                    // Found next destination. Since elevator will move to this floor, this floor is no longer a destination for down direction.
                    floors[index] = OPERATION_NONE; // < This changed
                    this.destination = index;
                    return
                }else if(operation == OPERATION_BOTH) {
                    // Found next destination. Since elevator will move to this floor, this floor is no longer a destination for down direction. Since the operation was for both directions, this floor is still a destination for up direction.
                    floors[index] = OPERATION_UP;
                    this.destination = index;
                    return
                }
            }
            
        }else if(direction == DIRECTION_UP) {
            for (let index = this.currentFloor + 1; index < FLOOR_COUNT; index++) {
                var operation = floors[index];
                // 0 : Neutral operation. Someone will get off of the elevator.
                // 1 : Someone that is going up will get in the elevator.
                if(operation == OPERATION_NEUTRAL || operation == OPERATION_UP) {
                    // Found next destination. Since elevator will move to this floor, this floor is no longer a destination for up direction.
                    floors[index] = OPERATION_NONE
                    this.destination = index;
                    return
                }else if(operation == OPERATION_BOTH) {
                    // Found next destination. Since elevator will move to this floor, this floor is no longer a destination for up direction. Since the operation was for both directions, this floor is still a destination for down direction.
                    floors[index] = OPERATION_DOWN
                    this.destination = index;
                    return
                }
            }
        }
        
        // Could not find destination in given direction.
        return -1;
    }
    
    this.findDestination = function() {
        // Seeking for next destination in current direction.
        var found = nextDestination(this.direction);
        if(found > 0) {
            return found;
        }
        // Destination in current direction is not found, seeking for floor in opposite direction.
        found = nextDestination(-this.direction);
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
   },
   moveDown: function () {
      console.log('moving down');
   },
   stopAndOpenDoors: function () {
      console.log('stopping and opening doors');
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
    this.hw.addEventListener("doorsClosed", _.bind(this.onDoorsClosed, this));
    this.hw.addEventListener("beforeFloor", _.bind(this.onBeforeFloor, this));
};
Elevator.prototype = {
    onDoorsClosed: function (floor) {
        // Your code here
        var destination = this.hw.findDestination();
        if(this.hw.direction == DIRECTION_UP) {
            this.moveUp(destination);
        }else if(this.hw.direction == DIRECTION_DOWN) {
            this.moveDown(destination);
        }
        // else elevator is in idle mode.
    },
    onBeforeFloor: function (floor, direction) {
        // Your code here
        if(this.hw.destination == floor && this.hw.direction == direction) {
            this.stopAndOpenDoors();
        }
    },
    floorButtonPressed: function (floor, direction) {
        // Your code here
        this.hw.summon(floor, direction);
        if(this.hw.direction== DIRECTION_NONE)
        {
            onDoorsClosed(floor);
        }
    },
    cabinButtonPressed: function (floor) {
        // Your code here
        this.hw.summon(floor);
        if(this.hw.direction==DIRECTION_NONE)
        {
            onDoorsClosed(floor);
        }
    }
};