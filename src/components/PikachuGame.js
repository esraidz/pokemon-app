// src/components/PikachuGame.js
import React, { useRef, useEffect, useState } from "react";
import { Button, Typography, Box, Paper } from "@mui/material";

export default function PikachuGame() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [pikachuPos, setPikachuPos] = useState({ x: 50, y: 300 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size based on window size
    const setCanvasSize = () => {
      const aspectRatio = 2;
      canvas.width = window.innerWidth * 0.8 > 800 ? 800 : window.innerWidth * 0.8;
      canvas.height = canvas.width / aspectRatio;
    };
    window.addEventListener("resize", setCanvasSize);
    setCanvasSize();

    // Load background image
    const background = new Image();
    background.src = "/images/desktop-wallpaper-pokemon-ruby-sapphire-and-emerald-pokemon-sapphire.jpg";

    // Pikachu properties
    const pikachu = {
      x: canvas.width * 0.05,
      y: canvas.height * 0.75,
      width: 50,
      height: 50,
      dy: 0,
      gravity: 0.8,
      jumpPower: -16,
    };

    let obstacles = [];
    let obstacleTimer = 0;

    // Handle key presses
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        // Allow jump only if on the ground and game is not over
        if (pikachu.y >= canvas.height * 0.75 - 5 && !gameOver) {
          pikachu.dy = pikachu.jumpPower;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    let animationFrameId;

    // Main game loop
    const gameLoop = () => {
      // If the game is over, stop the animation and keep the final state on screen
      if (gameOver) {
        cancelAnimationFrame(animationFrameId);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Update Pikachu's position
      pikachu.dy += pikachu.gravity;
      pikachu.y += pikachu.dy;
      if (pikachu.y > canvas.height * 0.75) {
        pikachu.y = canvas.height * 0.75;
        pikachu.dy = 0;
      }
      setPikachuPos({ x: pikachu.x, y: pikachu.y });

      // Create new obstacles
      obstacleTimer++;
      if (obstacleTimer > 90) {
        obstacles.push({ x: canvas.width, y: canvas.height * 0.8, width: 30, height: 80, scored: false });
        obstacleTimer = 0;
      }

      // Update and draw obstacles
      for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= 5;
        ctx.fillStyle = "brown";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Collision detection
        if (
          pikachu.x < obs.x + obs.width &&
          pikachu.x + pikachu.width > obs.x &&
          pikachu.y < obs.y + obs.height &&
          pikachu.y + pikachu.height > obs.y
        ) {
          setGameOver(true);
        }

        // Score
        if (obs.x + obs.width < pikachu.x && !obs.scored) {
          setScore((prev) => prev + 1);
          obs.scored = true;
        }
      }

      // Remove off-screen obstacles to avoid performance issues
      obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

      // Score display
      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      ctx.fillText(`Score: ${score}`, 10, 30);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [score, gameOver]);

  const handleReset = () => {
    setScore(0);
    setGameOver(false);
  };

  return (
    <Box sx={{ p: 2, textAlign: "center", bgcolor: "#f0f0f0", minHeight: "100vh" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pikachu Jump Game
      </Typography>
      <Paper elevation={3} sx={{
        position: "relative",
        width: "80%",
        maxWidth: 800,
        margin: "auto",
        height: "auto",
        aspectRatio: "2 / 1",
        overflow: "hidden",
        border: "2px solid #333",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <canvas ref={canvasRef} />
        <img
          src="/images/Running-Pikachu-GIF.gif.webp"
          alt="Pikachu"
          style={{
            position: "absolute",
            left: pikachuPos.x,
            top: pikachuPos.y,
            width: 50,
            height: 50,
            pointerEvents: "none",
            transform: `translate(-50%, -50%)`,
          }}
        />
      </Paper>
      {gameOver && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" color="error">
            Game Over! Your Score: {score}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleReset} sx={{ mt: 2 }}>
            Play Again
          </Button>
        </Box>
      )}
    </Box>
  );
}