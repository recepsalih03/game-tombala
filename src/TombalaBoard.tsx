import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";

interface Cell {
  value: number | null;
  marked: boolean;
}

export function TombalaBoard() {
  const generateNumbers = (): number[] => {
    const nums: number[] = [];
    while (nums.length < 15) {
      const r = Math.floor(Math.random() * 90) + 1;
      if (!nums.includes(r)) nums.push(r);
    }
    return nums.sort((a, b) => a - b);
  };

  const [board, setBoard] = useState<Cell[][]>([]);

  useEffect(() => {
    const nums = generateNumbers();
    const matrix: Cell[][] = [];
    let idx = 0;

    for (let row = 0; row < 3; row++) {
      const rowNums = nums.slice(idx, idx + 5);
      idx += 5;

      const cells: Cell[] = Array.from({ length: 9 }).map(() => ({
        value: null,
        marked: false,
      }));

      const positions: number[] = [];
      while (positions.length < 5) {
        const p = Math.floor(Math.random() * 9);
        if (!positions.includes(p)) positions.push(p);
      }
      positions.sort((a, b) => a - b).forEach((pos, i) => {
        cells[pos] = { value: rowNums[i], marked: false };
      });

      matrix.push(cells);
    }

    setBoard(matrix);
  }, []);

  const handleCellClick = (r: number, c: number) => {
    setBoard((prev) =>
      prev.map((row, ri) =>
        row.map((cell, ci) => {
          if (ri === r && ci === c && cell.value !== null) {
            return { value: cell.value, marked: !cell.marked };
          }
          return cell;
        })
      )
    );
  };

  const cellStyle = (cell: Cell) => ({
    height: 40,
    width: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #bbb",
    backgroundColor: cell.value === null ? "#f0f0f0" : cell.marked ? "#90caf9" : "#fff",
    cursor: cell.value !== null ? "pointer" : "default",
  });

  return (
    <Paper elevation={3} sx={{ p: 2, backgroundColor: "#fafafa" }}>
      <Typography variant="h6" align="center" gutterBottom>
        Tombala Kartı
      </Typography>
      <Box>
        <Grid container spacing={0}>
          {board.map((row, ri) =>
            row.map((cell, ci) => (
              <Grid size="auto" key={`${ri}-${ci}`}>
                <Box
                  sx={cellStyle(cell)}
                  onClick={() => handleCellClick(ri, ci)}
                >
                  {cell.value !== null ? (
                    <Typography variant="body2" fontWeight={500}>
                      {cell.value}
                    </Typography>
                  ) : null}
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Paper>
  );
}