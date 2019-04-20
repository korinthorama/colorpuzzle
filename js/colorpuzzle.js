(function ($) {
    $.fn.extend({
        colorpuzzle: function (options) {
            var defaults = {
                max_moves: 201
            }
            var options = $.extend(defaults, options);
            options.max_moves = (options.max_moves > 201) ? options.max_moves : 201;
            var obj = $(this);
            var game = {
                colors: ['red', 'yellow', 'blue', 'green', 'cyan', 'magenta'],
                sounds: {
                    'move': new Audio('sounds/move.mp3'),
                    'win': new Audio('sounds/win.mp3'),
                    'loose': new Audio('sounds/loose.mp3')
                },
                init: function () {
                    this.registered = false;
                    this.MAX_MOVES = options.max_moves;
                    this.moves = 0;
                    this.high_score = this.get_high_score() || 0;
                    game.create();
                    tiles.init();
                    $('#power_on').on('click', function () {
                        if (confirm('Start a new game?')) {
                            game.start();
                        }
                    });
                    $('#start_game').on('click', function () {
                        game.start();
                    });
                    $('#game_info').on('click', function () {
                        if (game.moves) $('#start_game').show();
                        $('#game_info_screen').toggle();
                    });
                    $('#top_ten, #game_winners_screen').on('click', function () {
                        game.top_ten();
                    });
                    $('#game_win_screen, #game_over_screen').on('click', function () {
                        var id = window.setTimeout(function () {
                        }, 0); // get last timeout id
                        while (id--) window.clearTimeout(id); // clear all timeouts
                        game.prepare();
                    });
                },
                create: function () { // setup scene
                    var elements = {};
                    elements.container = $('<div id="colorpuzzle"></div>');
                    elements.playground = $('<div id="playground"></div>');
                    elements.tile = $('<div class="tile"></div>');
                    elements.game_info_screen = $('<div class="game_screen" id="game_info_screen"></div>');
                    elements.game_logo = $('<div id="game_logo"></div>');
                    elements.instructions = $('<div id="instructions"></div>');
                    elements.start_game = $('<div id="start_game">Start Game</div>');
                    elements.game_over_screen = $('<div class="game_screen" id="game_over_screen"><div>GAME OVER</div></div>');
                    elements.game_win_screen = $('<div class="game_screen" id="game_win_screen"><div>YOU ARE A WINNER!</div></div>');
                    elements.game_board = $('<div id="game_board"></div>');
                    elements.score_wrapper = $('<div id="score_wrapper"></div>');
                    elements.board_label_moves = $('<span class="board_label">moves: </span>');
                    elements.board_label_high_score = $('<span class="board_label high_score_label">best: </span>');
                    elements.input_moves = $('<input type="text" id="moves" class="game_info" value="0" disabled>');
                    elements.input_high_score = $('<input type="text" id="high_score" class="game_info" value="0" disabled>');
                    elements.power_on = $('<a id="power_on" title="start a new game"></a>');
                    elements.game_info = $('<a id="game_info" title="toggle the instructions"></a>');
                    elements.top_ten = $('<a id="top_ten" title="top ten players"></a>');
                    elements.winners = $('<div class="game_screen" id="game_winners_screen" style="display:block;"><div>TOP TEN</div><ol></ol></div>');
                    elements.score_wrapper.append(elements.board_label_moves);
                    elements.score_wrapper.append(elements.input_moves);
                    elements.score_wrapper.append(elements.board_label_high_score);
                    elements.score_wrapper.append(elements.input_high_score);
                    elements.score_wrapper.append(elements.power_on);
                    elements.game_board.append(elements.score_wrapper);
                    elements.game_info_screen.append(elements.game_logo);
                    elements.game_info_screen.append(elements.instructions);
                    elements.game_info_screen.append(elements.start_game);
                    elements.playground.append(elements.tile);
                    elements.container.append(elements.playground);
                    elements.container.append(elements.game_info_screen);
                    elements.container.append(elements.game_over_screen);
                    elements.container.append(elements.game_win_screen);
                    elements.container.append(elements.game_board);
                    elements.container.append(elements.game_info);
                    elements.container.append(elements.top_ten);
                    elements.container.append(elements.winners);
                    obj.append(elements.container);
                    elements.instructions.html('Line up (horizontally or vertically) the six colors in less than ' + this.MAX_MOVES + ' moves!<br>Move each colored tile to the closest gap just by clicking on it.<br><br>Good luck!');
                    game.prepare();
                },
                save_high_score: function () {
                    var limit_score = game.get_limit_score();
                    if (game.moves > limit_score) return false;
                    var name = prompt('Enter you name for the Top 10') || 'Player';
                    var winners = game.get_winners();
                    winners.push({'name': name, 'score': game.moves});
                    winners.sort(function (a, b) {
                        return a.score - b.score;
                    });
                    winners = winners.slice(0, 10);
                    helper.set_cookie('colorpuzzle_winners', JSON.stringify(winners), 365, '/');
                    game.top_ten();
                },
                get_winners: function () {
                    var winners = $.parseJSON(helper.get_cookie('colorpuzzle_winners'));
                    if (!winners) {
                        winners = [];
                        for (var n = 1; n <= 10; n++) {
                            winners.push({'name': 'Player', 'score': game.MAX_MOVES - 1}); // initialize with minimum high score
                        }
                    }
                    return winners;
                },
                get_high_score: function () {
                    return game.get_winners()[0].score;
                },
                get_limit_score: function () {
                    var winners = game.get_winners();
                    var limit_score = winners[9].score;
                    return limit_score;
                },
                top_ten: function () {
                    game.update_board();
                    var winners = game.get_winners();
                    var data = '';
                    for (i in winners) {
                        data += '<li><span>' + winners[i].name + '</span> <span class="top_ten_score">' + winners[i].score + '</span></li>';
                    }
                    $('#game_winners_screen ol').html(data);
                    if ($('#game_winners_screen').is(':visible')) {
                        if ($('#start_game').css('display') == 'none') {
                            game.handle_screens();
                        } else {
                            game.handle_screens('game_info_screen');
                        }
                    } else {
                        game.handle_screens('game_winners_screen');
                    }
                },
                handle_screens: function (id) {
                    $('.game_screen').hide();
                    if (id) $('#' + id).show();
                },
                update_board: function () {
                    $('#moves').val(game.moves);
                    $('#high_score').val(game.high_score);
                },
                prepare: function () {
                    game.moves = 0;
                    game.update_board();
                    game.handle_screens('game_info_screen');
                    $('#start_game').show();
                },
                start: function () {
                    game.moves = 0;
                    game.update_board();
                    $('#start_game').hide();
                    $('#game_info').show();
                    $('#power_on').css('visibility', 'visible');
                    game.handle_screens();
                    tiles.populate();
                },
                win: function () {
                    if (game.moves < game.high_score) { // less moves is winning for high score
                        game.high_score = game.moves;
                    }
                    var limit_score = game.get_limit_score();
                    if (game.moves <= limit_score) game.save_high_score();
                    game.handle_screens('game_win_screen');
                    game.sounds.win.play();
                    $('#power_on').css('visibility', 'hidden');
                    $('#game_info').hide();
                    setTimeout(function () {
                        game.prepare();
                    }, 5000);
                },
                game_over: function () {
                    game.handle_screens('game_over_screen');
                    game.sounds.loose.play();
                    game.update_board();
                    $('.clone').off('click');
                    $('#power_on').css('visibility', 'hidden');
                    $('#game_info').hide();
                    setTimeout(function () {
                        game.prepare();
                    }, 5000);
                },
            }
            var tiles = {
                items: {
                    'tile1': {'x': 0, 'y': 0, 'color': 'red'},
                    'tile2': {'x': 50, 'y': 0, 'color': 'green'},
                    'tile3': {'x': 100, 'y': 0, 'color': 'blue'},
                    'tile4': {'x': 150, 'y': 0, 'color': 'yellow'},
                    'tile5': {'x': 200, 'y': 0, 'color': 'cyan'},
                    'tile6': {'x': 250, 'y': 0, 'color': 'magenta'},
                    'tile7': {'x': 0, 'y': 50, 'color': 'yellow'},
                    'tile8': {'x': 50, 'y': 50, 'color': 'magenta'},
                    'tile9': {'x': 100, 'y': 50, 'color': 'cyan'},
                    'tile10': {'x': 200, 'y': 50, 'color': 'red'},
                    'tile11': {'x': 250, 'y': 50, 'color': 'green'},
                    'tile12': {'x': 0, 'y': 100, 'color': 'cyan'},
                    'tile13': {'x': 50, 'y': 100, 'color': 'red'},
                    'tile14': {'x': 100, 'y': 100, 'color': 'blue'},
                    'tile15': {'x': 150, 'y': 100, 'color': 'green'},
                    'tile16': {'x': 200, 'y': 100, 'color': 'yellow'},
                    'tile17': {'x': 250, 'y': 100, 'color': 'blue'},
                    'tile18': {'x': 0, 'y': 150, 'color': 'green'},
                    'tile19': {'x': 50, 'y': 150, 'color': 'cyan'},
                    'tile20': {'x': 100, 'y': 150, 'color': 'yellow'},
                    'tile21': {'x': 150, 'y': 150, 'color': 'cyan'},
                    'tile22': {'x': 200, 'y': 150, 'color': 'blue'},
                    'tile23': {'x': 250, 'y': 150, 'color': 'red'},
                    'tile24': {'x': 0, 'y': 200, 'color': 'magenta'},
                    'tile25': {'x': 50, 'y': 200, 'color': 'blue'},
                    'tile26': {'x': 100, 'y': 200, 'color': 'red'},
                    'tile27': {'x': 150, 'y': 200, 'color': 'green'},
                    'tile28': {'x': 200, 'y': 200, 'color': 'magenta'},
                    'tile29': {'x': 250, 'y': 200, 'color': 'yellow'},
                    'tile30': {'x': 0, 'y': 250, 'color': 'green'},
                    'tile31': {'x': 50, 'y': 250, 'color': 'yellow'},
                    'tile32': {'x': 100, 'y': 250, 'color': 'magenta'},
                    'tile33': {'x': 150, 'y': 250, 'color': 'blue'},
                    'tile34': {'x': 200, 'y': 250, 'color': 'red'},
                    'tile35': {'x': 250, 'y': 250, 'color': 'cyan'},
                    'tile36': {'x': 150, 'y': 50, 'color': 'transparent'},
                },
                init: function () {
                    this.populate(); // place the tiles
                },
                populate: function () {
                    var playground = $('#playground');
                    $('.clone').remove(); // remove tiles in order to recreate 'em
                    var tile_prototype = $('.tile').clone(); // create a clone of  the prototype tile
                    var tile, color;
                    for (i in this.items) { // loop to place all tiles to the corresponding positions
                        tile = tile_prototype.clone(); // create new tile
                        tile.attr('id', i).addClass('clone tile_' + this.items[i].color); // add id and class attributes
                        tile.css({ // set position
                            'display': 'block',
                            'left': this.items[i].x + 'px',
                            'top': this.items[i].y + 'px',
                        });
                        playground.append(tile); // place the tile to the playground
                        if (tile.attr('id') != 'tile36') {
                            tiles.events(tile.attr('id'));
                        }
                    }
                },
                events: function (id) {
                    var elm = $('#' + id);
                    elm.on('click', function () {
                        tiles.move(id);
                    });
                },
                move: function (id) {
                    var index = id.replace('tile', '');
                    var elm = $('#' + id);
                    var space = $('#tile36');
                    var space_x = space.position().left;
                    var space_y = space.position().top;
                    var x = elm.position().left;
                    var y = elm.position().top;
                    if (((x - 50 == space_x || x + 50 == space_x) && y == space_y) || ((y - 50 == space_y || y + 50 == space_y) && x == space_x)) {
                        elm.css({'top': space_y, 'left': space_x});
                        space.css({'top': y, 'left': x});
                        game.moves++;
                        game.update_board();
                        game.sounds.move.play();
                        if (game.moves == game.MAX_MOVES) {
                            game.game_over();
                        } else {
                            tiles.check();
                        }
                    }
                },
                check: function () { // check if everything  is aligned
                    var horizontally = {
                        'red': [],
                        'yellow': [],
                        'blue': [],
                        'green': [],
                        'cyan': []
                    };
                    var vertically = {
                        'red': [],
                        'yellow': [],
                        'blue': [],
                        'green': [],
                        'cyan': []
                    };
                    for (i in game.colors) {
                        $('.tile_' + game.colors[i]).each(function () {
                            if (game.colors[i] != 'magenta') { // there is no need to check the last color
                                horizontally[game.colors[i]].push($(this).position().top);
                                vertically[game.colors[i]].push($(this).position().left);
                            }
                        });
                    }
                    if (helper.equal(horizontally['red']) && helper.equal(horizontally['blue']) && helper.equal(horizontally['green']) && helper.equal(horizontally['yellow']) && helper.equal(horizontally['cyan'])
                        || helper.equal(vertically['red']) && helper.equal(vertically['blue']) && helper.equal(vertically['green']) && helper.equal(vertically['yellow']) && helper.equal(vertically['cyan'])) {
                        game.win();
                    }

                },
            }
            var helper = {
                equal: function (arr) {
                    var first = arr[0];
                    return arr.every(function (element) {
                        return element === first;
                    });
                },
                set_cookie: function (name, value, expires, path, domain, secure) {
                    var today = new Date();
                    today.setTime(today.getTime());
                    if (expires)expires = expires * 1000 * 60 * 60 * 24;
                    var expires_date = new Date(today.getTime() + (expires));
                    document.cookie = name + "=" + escape(value) +
                        ((expires) ? ";expires=" + expires_date.toGMTString() : "") +
                        ((path) ? ";path=" + path : "") +
                        ((domain) ? ";domain=" + domain : "") +
                        ((secure) ? ";secure" : "" );
                },
                get_cookie: function (check_name) {
                    var a_all_cookies = document.cookie.split(';');
                    var a_temp_cookie = '';
                    var cookie_name = '';
                    var cookie_value = '';
                    var b_cookie_found = false;
                    for (i = 0; i < a_all_cookies.length; i++) {
                        a_temp_cookie = a_all_cookies[i].split('=');
                        cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');
                        if (cookie_name == check_name) {
                            b_cookie_found = true;
                            if (a_temp_cookie.length > 1) {
                                cookie_value = unescape(a_temp_cookie[1].replace(/^\s+|\s+$/g, ''));
                            }
                            return cookie_value;
                            break;
                        }
                        a_temp_cookie = null;
                        cookie_name = '';
                    }
                    if (!b_cookie_found) {
                        return null;
                    }
                },
            }
            game.init(); // start game
        }
    });
})(jQuery);


