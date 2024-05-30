
const worldwidth = 100
const worldheight = 100

const cellwidth = 3

var paused = true

noisy.seed(Math.random())

var centers = []

function tectonic_plates(n) {
    for (i=0;i<n;i++) {
        centers.push([Math.floor(Math.random()*worldwidth*0.5)+(worldwidth/6),Math.floor(Math.random()*worldheight*0.5)+(worldheight/6)])
    }
}

var rules = [
    //NEW METARULE: rules should be 10 ints starting with a 0
    [2,2,2,2,2,2,2,2,2,2], //unchanging rule 0
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
    [0,4,2,1,0,2,1,1,1,1],
    [0,2,4,4,4,1,1,1,1,1], //another growth rule? too smooth...
]

var which_rule = 10
var stepcount = 0
var rules_list = [8,9,5,11]
var rules_program =[
    // // {
    // //     rule: 6,
    // //     steps: 1
    // // },
    // {
    //     rule: 10,
    //     steps: 30
    // },
    // {
    //     rule: 9,
    //     steps: 1
    // },
    // {
    //     rule: 5,
    //     steps: 5
    // },
    // {
    //     rule: 13,
    //     steps: 10
    // },
    // {
    //     rule: 9,
    //     steps: 1
    // },
    {
        rule: 5,
        steps: 5
    },
    {
        rule: 11,
        steps:1
    }
]

var draw_mode = 'terrain'

var world = new CAWorld({
    width: worldwidth,
    height: worldheight
})

function keyReleased() {
    if(key === '+'){
        world.step()
        stepcount++
    }
    if(keyCode === 32) {
        paused = !paused
    }
    if(key === 'e') {
        find_elevation()
    }
}


function find_elevation() {
    let sea_size = worldwidth*worldheight*0.0833
    for (sea in seas) {
        let this_sea = seas[sea]
        if (this_sea.length >= sea_size) {
            for (cell in this_sea) {
                this_sea[cell].alt = 0
            }

        }
    }
    draw_mode = 'altitude'
}


function mouseClicked() {
    find_ocean()
    // solve_elevation()
    // world.grid[Math.floor(Math.random()*worldwidth)][Math.floor(Math.random()*worldheight)].known = true
}

world.registerCellType('cell', {
    getColor: function() {
        // return this.awake ? [100-(this.age),35+(this.age*5),35+(this.age*5)] : [30, 30, 45]
        if (this.known) {
            return [200,50,200]
        }
        return this.awake ? [70,180,165] : [50,50,90]
    },
    process: function(neighbors) {
        if (this.known & neighbors.length > 0) {
            if (this.awake) {
                this.known = false
            } else {for (let guy in neighbors) {
                // console.log(neighbors[guy])
                if (neighbors[guy] != null) {
                    if (!neighbors[guy].awake && !neighbors[guy].known) {
                    neighbors[guy].known = true
                    known_sea.push(neighbors[guy])
                }
            }
            }}
        }
        if (draw_mode == 'altitude') {
            if (this.alt != undefined && !this.waiting) {
                let altless = neighbors.filter((n) => n != null && n.alt === undefined)
                for (guy in altless) {
                    altless[guy].alt = this.alt+1
                    altless[guy].waiting = true
                    altless[guy].delay(2, function(cell) {
                        cell.waiting = false
                    })
                }
            }
        }
        var wakefuls = this.countSurroundingCellsWithValue(neighbors, 'wasAwake');
        if(this.awake){
            wakefuls++
        }
        switch (rules[which_rule][wakefuls]) {
            case 0: 
                if (this.awake) {
                    this.age = 0
                    this.awake = false
                }
                
                break
            case 1:
                if (this.awake) {
                    this.age += 1
                    break
                }
                this.awake = true
                this.age = 1
                break
            case 2: 
                if (this.awake) {
                    this.age += 1
                }
                break
            case 3:
                if (this.awake) {
                    this.awake = false
                    this.age = 0
                } else {
                    this.awake = true
                }
                break
            case 4:
                if (Math.random() < 0.5) {
                    this.alive = !this.alive
                    if (!this.alive) {
                        this.age = 0
                    }
                }
        }
    },
    reset: function() {
        this.wasAwake = this.awake;
    }
}, function() {
    //init
    let prox = 0
    for (i=0;i<centers.length;i++){
        let newprox = (10-far([this.x,this.y],[centers[i][0],centers[i][1]]))/10
        if (newprox > 0){
            prox+=newprox
        }
    }
    this.awake = Math.random() < (100*(noisy.simplex2(this.x/100,this.y/100)+prox))/(far([this.x,this.y],[worldwidth/2,worldheight/2])) //noisy.simplex2(this.x/100,this.y/100)
    // this.age = 0
    this.waiting = false
});

tectonic_plates(5)
world.initialize([
    { name: 'cell', distribution: 100 }
])

// function run_program() {
//     for (i=0;i<rules_program.length;i++) {
//         let phase = rules_program[i]
//         which_rule = phase.rule
//         for (j=0;j<phase.steps;j++) {
//             world.step()
//         }
//         console.log("...")
//     }
//     console.log("generation complete.")
// }

var steplimit = 32
var phase_index = 0
var turn = 0
var phase = null
var known_sea = []
var seas = []

function prepare_program() {
    let program = []
    for (i=0;i<rules_program.length;i++) {
        for (j=0;j<rules_program[i].steps;j++) {
            program.push(rules_program[i].rule)
        }
    }
    return program
}

var program = []

function validCoords(x,y) {
    return x >= 0 && x <worldwidth && y >= 0 && y <worldheight
}

function find_ocean() {
    // let area = worldwidth*worldheight
    which_rule = 0
    let start = pick(pick(world.grid))
    while (start.awake || start.sea) {
        start = pick(pick(world.grid))
    }
    start.known = true
    known_sea.push(start)
    // for (i=0; i< 10;i++) {
    //     let delta = known_sea.length
    //     world.step()
    //     delta = known_sea.length - delta
    //     i-= delta
    // }

    // for (cell in known_sea) {
    //     known_sea[cell].sea = true
    //     known_sea[cell].known = false
    // }
    // for (i=0;i<30;i++) {
    //     world.step()
    // }
    // if (known_sea.length >= (area/2)) {
    //     for (cell in known_sea) {
    //         known_sea[cell].sea = true
    //         known_sea[cell].known = false
    //     }
    // }
}

function setup() {
    createCanvas(worldwidth*cellwidth, worldheight*cellwidth)
    textSize(14)
    frameRate(8)
    background(0)
    program = prepare_program()

    // run_program()
}

var index = 0
var sea_coverage = known_sea.length

function draw() {


    if (!paused ) {
        
        if (index < program.length) {
            which_rule = program[index]
            world.step()
            stepcount++
            index++
        } else {
            which_rule = 0
            // paused = true
            world.step()
            if (known_sea.length > sea_coverage) {
                sea_coverage = known_sea.length
            } else {
                if (known_sea.length > 0) {
                    seas.push(known_sea)
                    for (cell in known_sea) {
                        known_sea[cell].sea = true
                    }
                    console.log(`adding sea of ${known_sea.length} cells.`) //
                    known_sea = []
                    sea_coverage = 0
                }
            }
            stepcount++
        }
        
        // console.log(turn)
        // console.log(phase.steps)
    }
   
    
    // if (stepcount == steplimit) {
    //     console.log("complete!")
    // }
    for (var y=0; y<world.height; y++){
        for (var x = 0; x<world.width; x++){
            var cell = world.grid[y][x];
            noStroke()
            fill(cell.getColor())
            if (cell.known) {
                fill(150,50,150)
            }
            if (cell.sea) {
                fill(80,80,175)
            }
            if (draw_mode == 'altitude') {
                if (cell.alt == undefined) {
                    fill(150,0,150)
                }
                fill(cell.alt*20, cell.alt*10, 100-cell.alt)
                if (cell.waiting) {
                    fill(50,180,180)
                }
            }
            rect(x*cellwidth, y*cellwidth, cellwidth)
        }
    }
    if (paused) {
        stroke(0)
        fill(255 )
        text('!--paused--!', width/2, 20 )
    }
    stroke(0)
    fill(255)

    text('rule #'+which_rule, 50, 20)
    
    text(stepcount, 10, 20) 


    
}
