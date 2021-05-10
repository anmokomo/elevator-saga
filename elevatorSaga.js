{
    init: function(elevators, floors) {

        //Elevator
        var elevator = elevators[0]; // Let's use the first elevator

        //Elevator Events
        elevator.on("idle", function() {
            elevator.goToFloor(0);
        });

        elevator.on("floor_button_pressed", function(floorNum) {
            console.log("Floor button pressed: ",floorNum);
            console.log("Elevator pressed floors: ",elevator.getPressedFloors());
            elevator.goToFloor(floorNum);
            console.log("destinationQueue",elevator.destinationQueue);
        });

        elevator.on("passing_floor", function(floorNum, direction) {
            //console.log("Passing floor ",floorNum," ",direction);
        });
        elevator.on("stopped_at_floor", function(floorNum) {
            //console.log("Stopped on floor ",floorNum);
        });

        //Floors
        floors.forEach((thisFloor,i) => {

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