{
    init: function(elevators, floors) {

        //TODO if idle and empty, currentDirection = none?
        //Elevator
        //Elevator Events
        elevators.forEach((thisElevator, index) => {
            thisElevator.currentDirection = ""
            thisElevator.isEmpty = thisElevator.loadFactor() == "0" ? true : false;
            thisElevator.isFull = thisElevator.loadFactor() == "1" ? true : false;
            thisElevator.updateDirection = function () {
                //this.currentDirection = (this.currentFloor() <= this.destinationQueue[0]) ? "up" : "down";
                if (thisElevator.destinationQueue.length > 0) {
                    if (thisElevator.currentFloor() <= thisElevator.destinationQueue[0]) {
                        thisElevator.currentDirection = "up";
                        thisElevator.goingUpIndicator(true);
                        thisElevator.goingDownIndicator(false);
                    }
                    if (thisElevator.currentFloor() > thisElevator.destinationQueue[0]) {
                        thisElevator.currentDirection = "down";
                        thisElevator.goingUpIndicator(false);
                        thisElevator.goingDownIndicator(true);
                    }
                } else {
                    thisElevator.goingUpIndicator(true);
                    thisElevator.goingDownIndicator(true);
                }
            }

            thisElevator.on("idle", function() {
            });

            //TODO instead of the passing listeners, could/should we sort levels from the up/down queue into the destination queue here? See comment at top of file
            thisElevator.on("floor_button_pressed", function(floorNum) {
                //if floor pressed is below the next destination AND currDir = up / opposite for down, then put destination on the end
                let destinationQueue = thisElevator.destinationQueue;
                console.log("Floor button pressed: ",floorNum," Elevator pressed floors: ",thisElevator.getPressedFloors());
                thisElevator.goToFloor(floorNum)
                if(thisElevator.currentDirection == "up") {
                    let arrUp = getFloorQueues("up")
                    destinationQueue.sort()
                    for (let i = 0; i < arrUp.length; i++){
                        if (arrUp[i] > destinationQueue[destinationQueue.length-1]){
                            thisElevator.goToFloor(arrUp[i]);
                            console.log("Added floors to queue: ",destinationQueue)
                        }
                    }
                } else if (thisElevator.currentDirection == "down") {
                    //TODO same as above
                    thisElevator.destinationQueue.reverse()
                }
                thisElevator.updateDirection();
                console.log("Elev ",index," destinationQueue after floor button push ",thisElevator.destinationQueue," Direction: ",thisElevator.currentDirection)
            });

            //Drop off or pick up if: floor is in destination queue or person is waiting and going in the same direction
            thisElevator.on("passing_floor", function(floorNum, direction) {
                if (direction == "up" && (floors[floorNum].upWaiting || thisElevator.destinationQueue.includes(floorNum)) && !thisElevator.isFull) {
                    this.goToFloor(floorNum,true);
                    console.log("Up and up, new queue: ",thisElevator.destinationQueue)
                }
                if (direction == "down" && (floors[floorNum].downWaiting || thisElevator.destinationQueue.includes(floorNum)) && !thisElevator.isFull) {
                    this.goToFloor(floorNum,true);
                    console.log("Down and down, new queue: ",thisElevator.destinationQueue)

                }
            })
            //
            thisElevator.on("stopped_at_floor", function(floorNum) {
                thisElevator.updateDirection();
                console.log("Elev ",index," destinationQueue after floor button push ",thisElevator.destinationQueue," Direction: ",thisElevator.currentDirection)
                clearFloorStatus(thisElevator.currentDirection,floorNum)
                //printFloorQueues();
            })
        })

        //Floors
        //elevator and floor actions seperate
        floors.forEach((thisFloor,floorNum) => {
            thisFloor.upWaiting = false
            thisFloor.downWaiting = false

            thisFloor.on("down_button_pressed", function() {
                thisFloor.downWaiting = true;
                sendOpenElevator(floorNum)
            });

            thisFloor.on("up_button_pressed", function() {
                thisFloor.upWaiting = true;
                console.log("Up button pressed on floor ",floorNum," upWaiting: ",thisFloor.upWaiting)
                console.log("Up queue: ",getFloorQueues("up"))
                for (let j = 0; j < elevators.length; j++) {
                    console.log("Elev in loop ",j,"destinationQueue: ",elevators[j].destinationQueue)
                    if (elevators[j].isEmpty && elevators[j].destinationQueue.length == 0) {
                        console.log("Elev ",j," goToFloor ",floorNum)
                        elevators[j].goToFloor(floorNum,true);
                        thisFloor.upWaiting=false;
                        break;
                    }
                }
            });
        });

        function clearFloorStatus(direction,floorNum){
            if (direction == "up") {
                floors[floorNum].upWaiting = false
            } else if (direction == "down") {
                floors[floorNum].downWaiting = false
            }
        }

        //Params: "up", "down", "all"
        function getFloorQueues(direction) {
            let returnQueue = new Array()
            floors.forEach((floor,floorNum) => {
                if (direction == "up" && floor.upWaiting) {
                    returnQueue.push(floorNum)
                }
                if (direction == "down" && floor.downWaiting) {
                    returnQueue.push(floorNum)
                    returnQueue.reverse()
                } else if (direction == "all" && (floor.downWaiting || floor.upWaiting)) {
                    returnQueue.push(floorNum)
                }
            })
            return returnQueue
        }

        //TODO catch undefined lowArr/highArr cases better
        function findClosest(target,queue) {
            console.log("*****Finding closest*****")
            let lowArr = queue.filter(floor => floor < target)
            let highArr = queue.filter(floor => floor > target)
            console.log("lowArr ",lowArr)
            console.log("highArr ",highArr)
            let lowFloorDiff = Math.abs(lowArr[0]-target)
            let highFloorDiff = Math.abs(highArr[0]-target)
            console.log("lowFloorDiff ",lowFloorDiff)
            console.log("highFloorDiff ",highFloorDiff)
            if ((highFloorDiff) && highFloorDiff < lowFloorDiff) { return highArr[0] }
            if ((lowFloorDiff) && lowFloorDiff < highFloorDiff) { return lowArr[0] }
            else  {
                return 0
            }
        }

        function sendOpenElevator(floorNum) {
            //start on the right instead of the left...helps things a tiny bit in the beginning
            for (let j = 0; j < elevators.length; j++) {
                console.log("Elev in loop ",j,"destinationQueue: ",elevators[j].destinationQueue)
                if (elevators[j].isEmpty && elevators[j].destinationQueue.length == 0) {
                    console.log("Elev ",j," is empty, no destinationQueue, goToFloor ",floorNum)
                    elevators[j].goToFloor(floorNum,true);
                    break;
                }
            }
        }

        function printDestinationQueues() {
            elevators.forEach((elevator,i) => {
                console.log("elevator ",i," direction: ",elevator.currentDirection," destinationQueue: ",elevator.destinationQueue)
            })
        }

        function printFloorQueues() {
            floors.forEach((floor,i) => {
                console.log("Floor ",i," Up waiting: ",floor.upWaiting," Down waiting: ",floor.downWaiting)
            })
        }


    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}