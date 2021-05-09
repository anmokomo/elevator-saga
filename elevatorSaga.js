{
    init: function(elevators, floors) {
        console.log("Elevators: ",elevators);
        console.log("Floors: ",floors);

        //Elevator
        var elevator = elevators[0]; // Let's use the first elevator
        console.log("Max passengers: ",elevator.maxPassengerCount())

        // no more queued destinations
        elevator.on("idle", function() {

        });

        elevator.on("floor_button_pressed", function(floorNum) {
            console.log("Floor button pressed: ",floorNum);
            console.log("Elevator pressed floors: ",elevator.getPressedFloors());
            elevator.goToFloor(floorNum);
            console.log("destinationQueue",elevator.destinationQueue);
        });

        elevator.on("passing_floor", function(floorNum, direction) {
            console.log("Passing floor ",floorNum," ",direction);
        });
        elevator.on("stopped_at_floor", function(floorNum) {
            console.log("Stopped on floor ",floorNum);
        });

        //Floors
        floors.forEach((thisFloor,i) => {
                console.log("Setting listeners on floor ",i);
                thisFloor.on("down_button_pressed", function() {
                    console.log("Down button pressed on floor ",i);
                    elevator.goToFloor(i);
                });
                thisFloor.on("up_button_pressed", function() {
                    console.log("Up button pressed on floor ",i);
                    elevator.goToFloor(i);
                });
            }
        );
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}