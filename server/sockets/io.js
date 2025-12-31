

module.exports = io => {
    io.on('connection', socket => {
        console.log('New socket connection');

        let currentCode = null;

        socket.on('move', function (move) {
            console.log('move detected')

            if (games[currentCode]) {
                games[currentCode].moveCount++;
                // Toggle timer
                const game = games[currentCode];
                if (game.activeTimer === 'white') {
                    game.activeTimer = 'black';
                } else if (game.activeTimer === 'black') {
                    game.activeTimer = 'white';
                }

                io.to(currentCode).emit('timeSync', {
                    timers: game.timers,
                    activeTimer: game.activeTimer
                });
            }

            io.to(currentCode).emit('newMove', move);
        });

        socket.on('joinGame', function (data) {
            currentCode = data.code;
            const color = data.color;

            if (!games[currentCode]) {
                if (Object.keys(games).length >= MAX_GAMES) {
                    return socket.emit('errorJoin', 'limitReached');
                }
                games[currentCode] = {
                    white: null,
                    black: null,
                    hasStarted: false,
                    moveCount: 0,
                    ready: { white: false, black: false }
                };
            }

            if (color === 'white' || color === 'black') {
                if (games[currentCode][color]) {
                    return socket.emit('errorJoin', 'roleTaken');
                }
                games[currentCode][color] = socket.id;
            }

            socket.join(currentCode);

            // Notify others in room
            socket.to(currentCode).emit('playerJoined', { color: color });

            if (games[currentCode].white && games[currentCode].black) {
                // If game is not active (no timer running), reset ready states
                if (!games[currentCode].activeTimer) {
                    games[currentCode].hasStarted = false;
                    games[currentCode].ready = { white: false, black: false };
                }
                io.to(currentCode).emit('bothConnected');
            }
        });

        socket.on('playerReady', function (data) {
            const game = games[currentCode];
            if (game) {
                // Determine color based on socket.id for security
                let color = null;
                if (game.white === socket.id) color = 'white';
                else if (game.black === socket.id) color = 'black';

                if (!color) return; // Not a player

                if (!game.ready) game.ready = { white: false, black: false };
                game.ready[color] = true;

                io.to(currentCode).emit('playerReady', { color: color });

                if (game.ready.white && game.ready.black) {
                    game.hasStarted = true;
                    if (!game.activeTimer) {
                        game.activeTimer = 'white';
                        game.timers = { white: 900, black: 900 };
                    }

                    io.to(currentCode).emit('startGame');
                    io.to(currentCode).emit('timeSync', {
                        timers: game.timers,
                        activeTimer: game.activeTimer
                    });
                }
            }
        });

        socket.on('requestReplay', function (data) {
            const code = data.code;
            if (games[code]) {
                games[code].moveCount = 0;
                games[code].timers = { white: 900, black: 900 };
                games[code].activeTimer = null; // Don't start until ready
                games[code].ready = { white: false, black: false }; // Reset ready for replay
                games[code].hasStarted = false; // Reset start flag

                io.to(code).emit('gameReplayed');
                io.to(code).emit('timeSync', {
                    timers: games[code].timers,
                    activeTimer: games[code].activeTimer
                });
            }
        });

        socket.on('resign', function (data) {
            const code = data.code;
            const loser = data.color;
            if (games[code]) {
                const winner = loser === 'white' ? 'black' : 'white';
                games[code].activeTimer = null; // Stop timer on surrender
                games[code].ready = { white: false, black: false }; // Reset ready
                io.to(code).emit('gameResigned', { winner, loser });
            }
        });

        socket.on('closeRoom', function (data) {
            const code = data.code;
            if (games[code] && games[code].white === socket.id) {
                io.to(code).emit('roomClosed');
                delete games[code];
            }
        });

        socket.on('stopTimer', function (data) {
            const code = data.code;
            if (games[code]) {
                games[code].activeTimer = null;
            }
        });

        socket.on('disconnect', function () {
            console.log('socket disconnected');

            if (currentCode && games[currentCode]) {
                const isPlayer = games[currentCode].white === socket.id || games[currentCode].black === socket.id;
                const activeGame = games[currentCode].hasStarted && games[currentCode].moveCount > 0;

                const color = games[currentCode].white === socket.id ? 'white' : 'black';

                // Free the role
                if (games[currentCode].white === socket.id) games[currentCode].white = null;
                if (games[currentCode].black === socket.id) games[currentCode].black = null;

                if (games[currentCode].ready) {
                    games[currentCode].ready[color] = false;
                }

                socket.to(currentCode).emit('playerLeft', { color: color });

                // Emmit Game Over only if an active player left during an ONGOING game
                if (isPlayer && activeGame) {
                    games[currentCode].activeTimer = null; // Stop timer on disconnect
                    io.to(currentCode).emit('gameOverDisconnect');
                }

                // If both left, delete game
                if (!games[currentCode].white && !games[currentCode].black) {
                    delete games[currentCode];
                }
            }
        });

    });

    // Background timer tick
    setInterval(() => {
        for (const code in games) {
            const game = games[code];
            if (game.hasStarted && game.activeTimer) {
                game.timers[game.activeTimer]--;

                if (game.timers[game.activeTimer] <= 0) {
                    game.timers[game.activeTimer] = 0;
                    const winner = game.activeTimer === 'white' ? 'black' : 'white';
                    io.to(code).emit('gameOverTimeout', { winner });
                    game.activeTimer = null; // Stop timer
                }

                // Periodic sync every 10 seconds to keep drift low, 
                // but client will also count down locally for smoothness
                if (game.timers[game.activeTimer] % 10 === 0) {
                    io.to(code).emit('timeSync', {
                        timers: game.timers,
                        activeTimer: game.activeTimer
                    });
                }
            }
        }
    }, 1000);
};
