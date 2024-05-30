var rules = [
    [0,0,0,0,2,1,1,1,1,1],
    [0,1,0,0,2,2,2,1,2,2],
    [0,1,0,1,0,2,2,1,2,2],
    [0,0,0,3,0,2,2,1,2,2], //pretty good caverns with some pillars
    [0,0,0,0,2,2,2,1,2,2], //good shapes, too disconnected
    [0,0,0,0,2,2,2,1,1,1], //potential cleanup rule?
    [0,1,1,1,0,2,2,1,2,1],
    [0,2,0,0,2,2,2,2,1,2], 
    [0,0,0,2,2,1,0,0,0,2],
    [0,0,0,2,2,0,2,1,1,2],
    [0,2,4,1,0,2,2,1,1,1], //new growth rule/ 6-variant, using 4th case
    [0,0,2,2,4,1,1,1,1,1], // cleanup rule for small lakes
]


var world = {}

world.init = function(width,height,cell) {
    // console.log(cell) //how is this {val:0} and then i open it in the inspector and it's val:1
    world.width = width
    world.height = height
    world.grid = array2d(width, height, cell)
    world.oldgrid = world.grid
    world.rule = 0
}

world.seed = function(chance) {
    // let count = 0
    // console.log(this)
    for (i=0;i<this.width;i++) {
        for (j=0;j<this.height;j++) {
            // console.log(this.grid[i][j].type) // 1-2 dead and the rest alive, before any reassignment. i'm insane.
            if (chance>Math.random()) {
                this.grid[i][j] = 1
                // count++
            }
        }
    }
    // world.oldgrid = world.grid
    // console.log(`counted ${count} living cells.`) //this is what the number should be, but instead everything is type 1 even before being assigned.
    // this.count_living() // 10000
}

world.count_living = function() {
    let count = 0
    for (i=0;i<this.width;i++) {
        for (j=0;j<this.height;j++) {
            if (this.grid[i][j] == 1) {
                count++
            }
        }
    }
    console.log(`world contains ${count} living cells.`)
}


world.count_neighbors = function(x,y,grid = world.oldgrid,type=null) {
    let neighbors = []
    for (i=-1;i<2;i++) {
        for (j=-1;j<2;j++) {
            if (x+i < world.width && x+i > 0 && y+j < world.height && y+j > 0) {
                neighbors.push(grid[x+i][y+j])
            }
        }
    }
    if (type) {
        neighbors.filter((cell) => cell == type)
    }
    return neighbors
}


world.step = function() {
    world.oldgrid = world.grid

    for (i=0;i<world.width;i++) {
        for (j=0;j<world.height;j++) {
            let cell = world.grid[i][j]
            var neighbors = world.count_neighbors(i,j,world.oldgrid,1)
            var count = neighbors.length
            switch (rules[world.rule][count]) {
                case 0: 
                    if (cell == 1) {
                        cell = 0
                    }
                    
                    break
                case 1:
                    if (cell == 1) {
                        break
                    }
                    cell = 1
                    break
                case 2: 
                    break
                case 3:
                    if (cell == 1) {
                        cell = 0
                    } else {
                        cell = 1
                    }
                    break
                case 4:
                    if (Math.random() < 0.5) {
                        if (cell == 1) {
                            cell = 0
                            
                        } else {
                            cell = 1
                        }
                        break
                    }

            }
        }
    }

}
