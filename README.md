# Chess Online ♟️

A real-time multiplayer chess game built with Node.js, Express, Socket.io, and Tailwind CSS. Play with friends using unique room codes instantly in your browser.

## 🚀 Features

- **Real-time Gameplay**: Powered by Socket.io for instantaneous move syncing.
- **Private Rooms**: Create or join games using unique codes.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Game Controls**: Surrender, Play Again, and easy Room Code sharing.
- **Timers**: Interactive game clocks for both players.
- **Modern UI**: Sleek dark-mode aesthetic with smooth animations.

## 🛠️ Setup & Installation

Follow these steps to get the project running locally:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.16.0 or higher recommended)
- [Yarn](https://yarnpkg.com/) or npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/khaizinam/chess-online.git
   cd chess-online
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```

### Running the App
- **Development Mode** (with auto-reload):
  ```bash
  yarn watch
  ```
- **Production Mode**:
  ```bash
  yarn start
  ```
The server will start on the port specified in `config.js` (default: `3037`).

## 📜 Game Rules

- **Movement**: Standard chess rules apply.
- **Winning**: Checkmate the opponent or win if they run out of time.
- **Surrender**: You can choose to surrender at any time to end the game immediately.
- **Draw**: The game ends in a draw if the board reaching a standard draw position.

## 🤝 Support Us

If you enjoy this project and would like to support its development, you can make a donation via the QR code below:

![Support QR Code](front/public/img/qr_code.png)

*Thank you for your support!* 💖

## 👤 Author

Developed and maintained by **khaizinam**.
- **Website**: [khaizinam.io.vn](https://khaizinam.io.vn)
- **GitHub**: [@khaizinam](https://github.com/khaizinam)
