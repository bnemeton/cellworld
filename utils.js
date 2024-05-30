function array2d(width, height, value = 0) {
    // console.log(value) //type 1????
	let array = Array.from(Array(width), () => new Array(height).fill(0))
	array.width = width; array.height = height
    console.log(array) //how is this full of type 1.
	return array
}

function far(a,b) {
    return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2)
}