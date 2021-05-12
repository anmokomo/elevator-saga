{
    //Ideas: insert floors from floorQueue into the best choice destinationQueue (look @ direction); or for each floorQueue, create an object that can be moved around
    //....(cont) was ORIGINALLY looking at collection sorting/insertions....but then I kind of went in a more event-driven direction.  If I had more time, I'd start over and experiment with that
    //biggest side-effect of this implementation so far-  people on the top floor are waiting too long; too much of the person pick-up functionality surrounds passing by the floor; maybe floor queue -> destination queue immediate insertion after up/down push is best


    init: function(elevators, floors) {

        //Elevator
        //Elevator Events
        const ElevatorPath = {
            NONE: "none",
            UP: "up",
            DOWN:"down"
        }

        elevators.forEach((thisElevator, index) => {
            thisElevator.elevatorPath = ElevatorPath.NONE;
            thisElevator.isEmpty = thisElevator.loadFactor() == "0" ? true : false;
            thisElevator.isFull = thisElevator.loadFactor() == "1" ? true : false;
            thisElevator.isIdle = (thisElevator.isEmpty && thisElevator.destinationQueue.length == 0)
            thisElevator.updateDirection = function () {
                if (thisElevator.destinationQueue.length > 0) {
                    if (thisElevator.currentFloor() <= thisElevator.destinationQueue[0]) {
                        thisElevator.elevatorPath = ElevatorPath.UP;
                        thisElevator.goingUpIndicator(true);
                        thisElevator.goingDownIndicator(false);
                    }
                    if (thisElevator.currentFloor() > thisElevator.destinationQueue[0]) {
                        thisElevator.elevatorPath = ElevatorPath.DOWN;
                        thisElevator.goingUpIndicator(false);
                        thisElevator.goingDownIndicator(true);
                    }
                } else {
                    thisElevator.elevatorPath = ElevatorPath.NONE
                    thisElevator.goingUpIndicator(true);
                    thisElevator.goingDownIndicator(true);
                }
            }

            thisElevator.on("idle", function() {
            });

            //TODO instead of the passing listeners, could/should we sort levels from the up/down queue into the destination queue here? See comment at top of file
            thisElevator.on("floor_button_pressed", function(floorNum) {
                //if floor pressed is below the next destination AND currDir = up / opposite for down, then put destination on the end

                thisElevator.goToFloor(floorNum)

                if(thisElevator.elevatorPath == ElevatorPath.UP) {
                    let arrUp = getFloorQueues("up")
                    thisElevator.destinationQueue.sort()
                    thisElevator.checkDestinationQueue()

                } else if (thisElevator.elevatorPath == ElevatorPath.DOWN) {
                    //TODO same as above
                    thisElevator.destinationQueue.reverse()
                    thisElevator.checkDestinationQueue()
                }
                thisElevator.updateDirection();
            });

            //Drop off or pick up if: floor is in destination queue or person is waiting and going in the same direction
            thisElevator.on("passing_floor", function(floorNum, direction) {
                if (direction == "up" && (floors[floorNum].upWaiting || thisElevator.destinationQueue.includes(floorNum)) && !thisElevator.isFull) {
                    this.goToFloor(floorNum,true);
                }
                if (direction == "down" && (floors[floorNum].downWaiting || thisElevator.destinationQueue.includes(floorNum)) && !thisElevator.isFull) {
                    this.goToFloor(floorNum,true);
                }
            })
            //
            thisElevator.on("stopped_at_floor", function(floorNum) {
                thisElevator.updateDirection();
                clearFloorStatus(thisElevator.elevatorPath,floorNum)
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
                sendOpenElevator(floorNum)
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
            let lowFloorDiff = Math.abs(lowArr[0]-target)
            let highFloorDiff = Math.abs(highArr[0]-target)
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
                console.log("elevator ",i," elevatorPath: ",elevator.elevatorPath," destinationQueue: ",elevator.destinationQueue)
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