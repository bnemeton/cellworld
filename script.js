
const worldwidth = 300
const worldheight = 300

const cellwidth = 3

var paused = true

noisy.seed(Math.random())

var centers = []

function tectonic_plates(n) {
    for (i=0;i<n;i++) {
        centers.push([Math.floor(Math.random()*worldwidth*0.5)+(worldwidth/6),Math.floor(Math.random()*worldheight*0.5)+(worldheight/6)])
    }
    

    //this left a lot of hard edges
    // for (let a = 0; a < worldwidth; a++) {
    //     noisemap.push([])
    //     for (let b=0; b < worldheight; b++) {
    //         noisemap[a].push([0])
    //     }
    // }
    // for (let i = 0;i <n;i++) {
    //     let center = [Math.floor(Math.random()*worldwidth*0.8)+worldwidth/10, Math.floor(Math.random()*worldheight*0.8)+worldheight/10]
    //     let radius = worldwidth/5
    //     let topleft = [Math.max(center[0]-radius, 0), Math.max(center[1]-radius, 0)]
    //     console.log(topleft)
    //     for (let j=0;j<(2*radius);j++) {
    //         for (let k=0;(k<2*radius);k++) {
    //             if ((topleft[0] + j)<worldwidth && (topleft[1] + k)<worldheight)
    //             noisemap[topleft[0] + j][topleft[1] + k] += ((noisy.simplex2((topleft[0]+j)/50, (topleft[1]+k)/50))) //*((Math.sqrt((Math.abs(center.x-(topleft[0]+j))**2 + Math.abs(center.y-(topleft[1]+k))**2)))/radius)
    //         }
    //     }

    // }
    // console.log(noisemap)
}

var rules = [
    // [1,1,2,0,2,2,1,2,1], //"crawling caverns with pillar fill"
    // [1,0,2,0,2,2,1,1,2], //nice cavern shapes
    // [0,2,2,2,0,1,1,2,1], //caverns with incurved smooth walls
    // [0,0,2,2,1,0,0,0,2], //crawly animalcule boulder field
    // [2,0,0,2,2,2,1,2,2], //midscale labyrinthine caverns
    // [2, 0, 0, 2, 2, 1, 2, 1, 0], //mid size caverns
    // [1,1,0,2,2,2,2,1,2],
    // [2,0,1,0,0,1,1,2,2], 
    // [0,0,2,0,2,1,1,2,2], //i like this one a lot actually // start of My Rules :3
    //NEW METARULE: rules should be 10 ints starting with a 0
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

var which_rule = 10
var stepcount = 0
var rules_list = [8,9,5,11]
var rules_program =[
    {
        rule: 10,
        steps: 15
    },
    {
        rule: 9,
        steps: 1
    },
    {
        rule: 5,
        steps: 20
    },
    {
        rule: 10,
        steps: 30
    },
    {
        rule: 5,
        steps: 5
    },
    {
        rule: 11,
        steps:10
    }
]

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
}
function far(a,b) {
    return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2)
}

// function mouseClicked() {
//     rules_list.push(which_rule) 
//     which_rule = rules_list.shift()
    
// }

world.registerCellType('cell', {
    getColor: function() {
        // return this.awake ? [100-(this.age),35+(this.age*5),35+(this.age*5)] : [30, 30, 45]
        return this.awake ? [70,180,165] : [50,50,90]
    },
    process: function(neighbors) {
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
        let newprox = (20-far([this.x,this.y],[centers[i][0],centers[i][1]]))/10
        if (newprox > 0){
            prox+=newprox
        }
    }
    this.awake = Math.random() < (10*(noisy.simplex2(this.x/100,this.y/100)+prox))/(far([this.x,this.y],[worldwidth/2,worldheight/2])) //noisy.simplex2(this.x/100,this.y/100)
    this.age = 0
});

tectonic_plates(5)
world.initialize([
    { name: 'cell', distribution: 100 }
])

function run_program() {
    for (i=0;i<rules_program.length;i++) {
        let phase = rules_program[i]
        which_rule = phase.rule
        for (j=0;j<phase.steps;j++) {
            world.step()
        }
        console.log("...")
    }
    console.log("generation complete.")
}

var steplimit = 32

function setup() {
    createCanvas(worldwidth*cellwidth, worldheight*cellwidth)
    textSize(14)
    frameRate(8)
    background(0)
    run_program()
}

function draw() {


    // if (!paused) {
    //     world.step()
    //     stepcount++
    // }
   
    
    // if (stepcount == steplimit) {
    //     console.log("complete!")
    // }
    for (var y=0; y<world.height; y++){
        for (var x = 0; x<world.width; x++){
            var cell = world.grid[y][x];
            noStroke()
            fill(cell.getColor())
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
