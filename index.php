<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Color puzzle</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="css/page.css" type="text/css">
    <link rel="stylesheet" href="css/colorpuzzle.css" type="text/css">
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.js"></script>
    <script type="text/javascript" src="js/colorpuzzle.js"></script>
    <script type="text/javascript">
        $(document).ready(function () {
            $('#my_colorpuzzle').colorpuzzle({
                'max_moves': 201, /* set your max moves limit*/
            });
        });
    </script>
</head>
<body>
<div id="my_colorpuzzle"></div>
</body>
</html>