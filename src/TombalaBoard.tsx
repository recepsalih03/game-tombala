import React, { useEffect, useState } from "react";
import { Paper, Typography, Box, Button, Stack, Snackbar, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Socket } from "socket.io-client";

interface Cell {
  value: number | null;
  marked: boolean;
}

interface TombalaBoardProps {
  socket: Socket | null;
  lobbyId: string;
  username: string | null;
  gameState: any;
}

export function TombalaBoard({ socket, lobbyId, username, gameState }: TombalaBoardProps) {
  const theme = useTheme();
  const [board, setBoard] = useState<Cell[][]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<Set<number>>(new Set());
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  useEffect(() => {
    const generateNumbers = (): number[] => {
      const nums: number[] = [];
      while (nums.length < 15) {
        const r = Math.floor(Math.random() * 90) + 1;
        if (!nums.includes(r)) nums.push(r);
      }
      return nums.sort((a, b) => a - b);
    };
    const nums = generateNumbers();
    const matrix: Cell[][] = Array.from({ length: 3 }, () => Array.from({ length: 9 }, () => ({ value: null, marked: false })));
    let idx = 0;
    for (let row = 0; row < 3; row++) {
      const positions: number[] = [];
      while (positions.length < 5) {
        const p = Math.floor(Math.random() * 9);
        if (!positions.includes(p)) positions.push(p);
      }
      positions.sort((a, b) => a - b).forEach(pos => {
        matrix[row][pos] = { value: nums[idx++], marked: false };
      });
    }
    setBoard(matrix);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNumberDrawn = (data: { lobbyId: string; number: number }) => {
      if (data.lobbyId === lobbyId) {
        setDrawnNumbers(prev => new Set(prev).add(data.number));
      }
    };
    socket.on('tombala_number_drawn', handleNumberDrawn);
    return () => {
      socket.off('tombala_number_drawn', handleNumberDrawn);
    };
  }, [socket, lobbyId]);

  const handleDrawNumber = () => {
    if (!socket) return;
    const available = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !drawnNumbers.has(n));
    if (!available.length) return;
    const number = available[Math.floor(Math.random() * available.length)];
    socket.emit('tombala_number_drawn', { lobbyId, number });
    setDrawnNumbers(prev => new Set(prev).add(number));
  };

  const handleCellClick = (r: number, c: number) => {
    setBoard(prev => prev.map((row, ri) => row.map((cell, ci) => {
      if (ri === r && ci === c && cell.value !== null && drawnNumbers.has(cell.value)) {
        return { ...cell, marked: !cell.marked };
      }
      return cell;
    })));
  };

  const canClaim = (type: 'cinko1' | 'cinko2' | 'tombala') => {
    const flat = board.flat();
    const markedCount = flat.filter(cell => cell.marked).length;
    const rowCounts = board.map(row => row.filter(cell => cell.marked).length);
    const cinkoCount = rowCounts.filter(c => c === 5).length;
    if (type === 'cinko1') return cinkoCount >= 1 && !gameState?.cinko1;
    if (type === 'cinko2') return cinkoCount >= 2 && !gameState?.cinko2;
    if (type === 'tombala') return markedCount === 15 && !gameState?.tombala;
    return false;
  };

  const handleClaim = (type: 'cinko1' | 'cinko2' | 'tombala') => {
    if (socket && username) {
      socket.emit('claim_win', { lobbyId, username, claimType: type, board });
    }
    const msgs = { cinko1: '1. Çinko!', cinko2: '2. Çinko!', tombala: 'Tombala!' };
    setNotifMsg(msgs[type]);
    setNotifOpen(true);
  };

  const handleNotifClose = () => setNotifOpen(false);

  const cellStyle = (cell: Cell) => ({
    height: 40,
    width: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 1,
    borderColor: 'divider',
    cursor: cell.value !== null && drawnNumbers.has(cell.value) ? 'pointer' : 'default',
    bgcolor: cell.value === null ? 'background.default' : cell.marked ? 'success.light' : drawnNumbers.has(cell.value) ? 'primary.light' : 'background.paper'
  });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Button variant="contained" onClick={handleDrawNumber} disabled={drawnNumbers.size >= 90}>
          Sayı Çek
        </Button>
      </Box>
      <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" align="center">
          Tombala Kartınız
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(9, 40px)', gridTemplateRows: 'repeat(3, 40px)', gap: 1, justifyContent: 'center', mt: 2 }}>
          {board.map((row, ri) => row.map((cell, ci) => (
            <Box key={`${ri}-${ci}`} onClick={() => handleCellClick(ri, ci)} sx={cellStyle(cell)}>
              {cell.value !== null && <Typography fontSize={12}>{cell.value}</Typography>}
            </Box>
          )))}
        </Box>
        <Typography sx={{ mt: 2 }} fontSize={14}>
          Çekilen Sayılar: {Array.from(drawnNumbers).join(', ')}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
          <Button variant="contained" color="warning" onClick={() => handleClaim('cinko1')} disabled={!canClaim('cinko1')}>1. ÇİNKO</Button>
          <Button variant="contained" color="secondary" onClick={() => handleClaim('cinko2')} disabled={!canClaim('cinko2')}>2. ÇİNKO</Button>
          <Button variant="contained" color="error" onClick={() => handleClaim('tombala')} disabled={!canClaim('tombala')}>TOMBALA</Button>
        </Stack>
      </Paper>
      <Snackbar open={notifOpen} autoHideDuration={3000} onClose={handleNotifClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleNotifClose} severity="success" sx={{ width: '100%' }}>
          {notifMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}