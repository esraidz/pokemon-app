// src/pages/FAQPage.js
import React from "react";
import { Box, Typography } from "@mui/material";

export default function FAQPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>FAQ</Typography>
      <Typography variant="body1" gutterBottom>
        1. How to search for Pokémon?
      </Typography>
      <Typography variant="body1" gutterBottom>
        2. How to compare Pokémon?
      </Typography>
      <Typography variant="body1" gutterBottom>
        3. How does dark/light mode work?
      </Typography>
    </Box>
  );
}