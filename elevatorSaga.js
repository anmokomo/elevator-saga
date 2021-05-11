{
    init: function(elevators, floors) {

        //var queuedFloors = new Array();

        //Elevator
        //TODO update elevator.currentDirection property when destinationQueue changes
        elevators.forEach((thisElevator, i) => {
            //set initial direction to up...can only go up from here!
            this.currentDirection = "up"

            thisElevator.on("idle", function() {
                let queuedFloors = getQueues("all");
                console.log("queuedFloors: ",queuedFloors)
                if (queuedFloors.length > 0) {
                    this.goToFloor(queuedFloors[0]);
                } else {
                    this.goToFloor(0);
                }

                console.log("Updated with queued floor: ",this.destinationQueue)
            });

            thisElevator.on("floor_button_pressed", function(floorNum) {
                console.log("Floor button pressed: ",floorNum);
                console.log("Elevator pressed floors: ",thisElevator.getPressedFloors());
                thisElevator.goToFloor(floorNum);
                console.log("destinationQueue",thisElevator.destinationQueue);
            });

            //TODO stop on floor while passing if in destination queue
            //TODO stop on floor while padding if in correct direction and in floor queue
            thisElevator.on("passing_floor", function(floorNum, direction) {
                //console.log("Passing floor ",floorNum," ",direction);
                if (floors[floorNum].upWaiting && this.currentDirection == "up") {
                    this.goToFloor(floorNum,true);
                } else if (floors[floorNum].upWaiting && this.currentDirection == "up") {
                    this.goToFloor(floorNum,true);
                }
            });
            thisElevator.on("stopped_at_floor", function(floorNum) {
                //console.log("Stopped on floor ",floorNum);
            });
        })

        //Floors

        //keep elevator actions out of floor events
        floors.forEach((thisFloor,i) => {
                thisFloor.on("down_button_pressed", function() {
                    thisFloor.downWaiting = true;
                    console.log("Down button pressed on floor ",i);
                });

                thisFloor.on("up_button_pressed", function() {
                    thisFloor.upWaiting = true;
                    console.log("Up button pressed on floor ",i);
                });
            }
        );



        //Params: "up", "down", "all"
        //TODO: seperate if needed
        function getQueues(direction) {
            let returnQueue = new Array();
            floors.forEach((floor,floorNum) => {
                if (direction == "up" && floor.upWaiting) {
                    returnQueue.push(floorNum)
                }
                if (direction == "down" && floor.downWaiting) {
                    returnQueue.push(floorNum)
                } else if (direction == "all" && (floor.downWaiting || floor.upWaiting)) {
                    returnQueue.push(floorNum)
                }
            })
            return returnQueue
        }

        function goToNextFloorQueue(elevator) {
            let queuedFloors = getQueues("all");
            console.log("queuedFloors: ",queuedFloors)
            this.goToFloor(queuedFloors[0]);
            console.log("Updated with queued floor: ",this.destinationQueue)
        }

        function updateElevatorDirection(elevator) {
            this.currentDirection = (this.currentFloor() < this.destinationQueue[0]) ? "up" : "down";
        }

        function addToQueue(floor) {

        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}