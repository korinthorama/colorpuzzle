# Colored Tiles Puzzle jQuery plugin 

Just a simple puzzle game. Line up the six colored tiles in less than 201 moves (MIT License)

-- Instructions -- 

- Unpack  

- Include plugin's styles

`<link rel="stylesheet" href="css/colorpuzzle.css" type="text/css">`

- Include jQuery library

`<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.js"></script>`

- Include the plugin js code

`<script type="text/javascript" src="js/colorpuzzle.js"></script>`

- Create an empty container like <div id="my_colorpuzzle"></div>

- Make it a fully functional color puzzle

`<script type="text/javascript">`

	`$(document).ready(function () {`
	
		`$('#my_colorpuzzle').colorpuzzle({`
		
			`'max_moves': 201, /* set your max moves limit*/`
			
		`});`
		
	`});`
	
`</script>`

- Game controls: 
Move each colored tile to the closest gap just by clicking on it

Play a demo here:
https://webpage.gr/colorpuzzle/

Code is fun!  
