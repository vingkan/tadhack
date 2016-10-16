window.isP1 = function(){
	return getParameterByName('user') == 'user1';
}

var db = firebase.database();

var SECRET = ['T', 'A', 'D'];
var WIDTH = 4;
var HEIGHT = 10;
var TILES = 6;

function getRandomCoordinate(){
	//TODO
	return {
		x: Math.floor(WIDTH * Math.random()),
		y: Math.floor(HEIGHT * Math.random())
	}
}

function validCoordinate(x, y){
	var xIn = x > -1 && x < WIDTH;
	var yIn = y > -1 && y < HEIGHT;
	return xIn && yIn;
}

function getRandomAdjacentCoordinate(coord){
	var newX = coord.x;
	var newY = coord.y;
	var stillSearching = true;
	while(stillSearching){
		newX = coord.x + ( Math.floor(2 * Math.random()) - Math.floor(2 * Math.random()) );
		newY = coord.y + ( Math.floor(2 * Math.random()) - Math.floor(2 * Math.random()) );
		if(validCoordinate(newX, newY) && (coord.x === newX || coord.y === newY)){
			stillSearching = false;
		}
	}
	return {
		x: newX,
		y: newY
	}
}

function createGrid(width, height){
	var grid = [];
	for(var x = 0; x < width; x++){
		grid.push([]);
		for(var y = 0; y < height; y++){
			grid[x].push({
				type: 'EMPTY'
			});
		}
	}
	return grid;
}

function checkGrid(grid, coord){
	return grid[coord.x][coord.y];
}

function placePattern(grid, secret){
	var secretTile = {
		type: 'SECRET_TILE',
		code: secret.code,
		order: secret.order
	}
	var coord = getRandomCoordinate();
	grid[coord.x][coord.y] = secretTile;
	var placed = 1;
	while(placed < TILES){
		newCoord = getRandomAdjacentCoordinate(coord);
		if(checkGrid(grid, newCoord).type === 'EMPTY'){
			coord = newCoord;
			grid[coord.x][coord.y] = secretTile;
			placed++;
		}
	}
	return grid;
}

function printGrid(grid){
	var output = '';
	for(var y = 0; y < grid[0].length; y++){
		for(var x = 0; x < grid.length; x++){
			var cell = grid[x][y];
			if(cell.type == 'SECRET_TILE'){
				output += '[' + cell.code.charAt(0) + ']';
			}
			else{
				output += '[ ]';
			}

		}
		output += '\n';
	}
	console.log(output);
}

function highlightPatternByOrder(order){
	db.ref('board').once('value', function(xSnap){
		xSnap.forEach(function(ySnap){
			ySnap.forEach(function(cellSnap){
				var cell = cellSnap.val();
				if(cell.order === order){
					var x = ySnap.key;
					var y = cellSnap.key;
					db.ref('board/' + x + '/' + y + '/highlighted').set(true);
				}
			});
		});
	});
}

function wipePatternByOrder(order){
	db.ref('board').once('value', function(xSnap){
		xSnap.forEach(function(ySnap){
			ySnap.forEach(function(cellSnap){
				var cell = cellSnap.val();
				if(cell.order === order){
					var x = ySnap.key;
					var y = cellSnap.key;
					db.ref('board/' + x + '/' + y + '/clicked').set(false);
				}
			});
		});
	});
}

var lastCell = false;

function checkUnlocked(grid, order){
	var tilesUnlocked = [];
	for(var x = 0; x < grid.length; x++){
		for(var y = 0; y < grid[x].length; y++){
			var cell = grid[x][y];
			if(cell.order === order && cell.clicked){
				tilesUnlocked.push({x: x, y: y});
			}
		}
	}
	if(tilesUnlocked.length === TILES){
		for(var t = 0; t < tilesUnlocked.length; t++){
			var tX = tilesUnlocked[t].x;
			var tY = tilesUnlocked[t].y;
			db.ref('board/' + tX + '/' + tY + '/unlocked').set(true);
		}
	}
}

function clickCell(x, y){
	if(isP1()){
		var thisOrder = GRID[x][y].order;
		db.ref('board/' + x + '/' + y + '/clicked').set(true);
		highlightPatternByOrder(thisOrder);
		if(lastCell){
			var lastOrder = checkGrid(GRID, lastCell).order;
			if(thisOrder !== lastOrder){
				wipePatternByOrder(lastOrder);
			}
			else{
				checkUnlocked(GRID, lastOrder);
			}
		}
		lastCell = {x: x, y: y};
	}
}

window.GRID = false;

function gridToHTML(grid, id){
	var table = '<table>';
	for(var y = 0; y < grid[0].length; y++){
		var row = '<tr>';
		for(var x = 0; x < grid.length; x++){
			var cell = grid[x][y];
			var cellClass = 'empty';
			var cellValue = '-';
			if(cell.type == 'SECRET_TILE'){
				cellClass = 'pattern';
				if(cell.clicked){
					cellClass += ' clicked';
				}
				if(cell.unlocked){
					if(isP1()){
						cellValue = cell.code.charAt(0);
					}
					else{
						cellValue = cell.order;
					}
				}
				else{
					if(!isP1() && cell.highlighted){
						cellClass += ' highlighted';
					}
				}
			}
			row += '<td onclick="clickCell('+x+','+y+');" class="' + cellClass + '">' + cellValue + '</td>';
		}
		row += '</tr>';
		table += row;
	}
	table += '</table>';
	var target = document.getElementById(id);
	target.innerHTML = table;
	window.GRID = grid;
}

function main(){

	if(isP1()){
		var grid = createGrid(WIDTH, HEIGHT);
		for(var s = 0; s < SECRET.length; s++){
			grid = placePattern(grid, {
				code: SECRET[s],
				order: s
			});
		}
		printGrid(grid);
		gridToHTML(grid, 'game-grid');
		db.ref('board').set(grid);
	}
	else{
		db.ref('board').once('value', function(snap){
			var grid = snap.val();
			printGrid(grid);
			gridToHTML(grid, 'game-grid');
		});
	}

	db.ref('board').on('value', function(snap){
		var grid = snap.val();
		//console.log(grid);
		printGrid(grid);
		gridToHTML(grid, 'game-grid');
	});

}

main();

function checkPasscode(){
	var passed = true;
	var passcode = document.getElementById('passcode').value;
	for(var s = 0; s < SECRET.length; s++){
		if(SECRET[s] !== passcode.charAt(s).toUpperCase()){
			passed = false;
			break;
		}
	}
	if(passed){
		alert('Congratulations, you passed!');
	}
}