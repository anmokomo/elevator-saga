{
    init: function(elevators, floors) {

        //Elevator
        //Elevator Events
        //TODO handle elev lights
        elevators.forEach((thisElevator, index) => {
            thisElevator.currentDirection = "up"
            thisElevator.updateDirection = function updateElevatorDirection() {
                this.currentDirection = (this.currentFloor() < this.destinationQueue[0]) ? "up" : "down";
                console.log("updated elevator currentDirection: ",this.currentDirection)
            }

            thisElevator.on("idle", function() {
                let queuedFloors = getQueues("all")
                let currFloor = thisElevator.currentFloor()
                console.log("Idle Elev ",index," QueuedFloors: ",queuedFloors," currFloor ",currFloor)
                //if there's only 1 floor in the queue, go there
                if (queuedFloors.length == 1 ) {
                    thisElevator.goToFloor(queuedFloors,true)
                }
                if (queuedFloors.length > 2 ) {
                    let closestQueuedFloor = findClosest(currFloor,queuedFloors)
                    console.log("closest queued floor: ",closestQueuedFloor)
                    thisElevator.goToFloor(closestQueuedFloor)
                } else {
                    thisElevator.goToFloor(0)
                }
                thisElevator.updateDirection()
                console.log("Elev ",index," Updated with queued floor: ",thisElevator.destinationQueue)
            });
            thisElevator.on("floor_button_pressed", function(floorNum) {
                console.log("Floor button pressed: ",floorNum," Elevator pressed floors: ",thisElevator.getPressedFloors());
                thisElevator.goToFloor(floorNum)
                if(thisElevator.currentDirection == "up") {
                    //TODO instead of sort(), need to create function to sort with current lvl in mind; elev en floor3, direction=up,button pressed for 1; sort beginning with curr level instead of 0
                    thisElevator.destinationQueue.sort()
                } else if (thisElevator.currentDirection == "down") {
                    //TODO same as above
                    thisElevator.destinationQueue.reverse()
                }
                thisElevator.updateDirection();
                console.log("destinationQueue after floor button push ",thisElevator.destinationQueue)
            });

            //TODO stop on floor while passing if in destination queue (might not be needed anymore with queue sorting?)
            //TODO stop on floor while padding if in correct direction and in floor queue
            thisElevator.on("passing_floor", function(floorNum, direction) {
                console.log("Passing: ",floorNum," direction: ",direction," floor upWaiting: ",floors[floorNum].upWaiting," floor downWaiting: ",floors[floorNum].downWaiting);
                if (floors[floorNum].upWaiting && direction == "up") {
                    this.goToFloor(floorNum,true);
                    console.log("Up and up, new queue: ",thisElevator.destinationQueue)
                } else if (floors[floorNum].downWaiting && direction == "down") {
                    this.goToFloor(floorNum,true);
                    console.log("Down and down, new queue: ",thisElevator.destinationQueue)

                }
            })
            thisElevator.on("stopped_at_floor", function(floorNum) {
                //console.log("Stopped on floor ",floorNum);
                thisElevator.updateDirection();
                clearFloorStatus(thisElevator.currentDirection,floorNum)
            })

        })

        //Floors
        //elevator and floor actions seperate
        floors.forEach((thisFloor,i) => {
                thisFloor.on("down_button_pressed", function() {
                    thisFloor.downWaiting = true;
                    console.log("Down button pressed on floor ",i," downWaiting: ",thisFloor.downWaiting)
                    console.log("Down queue: ",getQueues("down"))
                });

                thisFloor.on("up_button_pressed", function() {
                    thisFloor.upWaiting = true;
                    console.log("Up button pressed on floor ",i," upWaiting: ",thisFloor.upWaiting)
                    console.log("Up queue: ",getQueues("up"))
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
        //Had a global array for the queue...but switched to use this get function instead; easier to maintain I think
        function getQueues(direction) {
            let returnQueue = new Array()
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
            if ((highFloorDiff) && highFloorDiff < lowFloorDiff) { return highFloorDiff }
            if ((lowFloorDiff) && lowFloorDiff < highFloorDiff) { return lowFloorDiff }
            else  {
                console.log("else....go to first in queue")
                return getQueues("all")[0]
            }
        }


    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}