import React, { useEffect, useState } from "react";
import { Paper, Typography, Box, Button, Stack, Snackbar, Alert } from "@mui/material";
import { Socket } from "socket.io-client";

interface Cell {
  value: number | null;
  marked: boolean;
}

interface TombalaBoardProps {
  socket: Socket | null;
  lobbyId: string;
  username: string | null;
}

export function TombalaBoard({ socket, lobbyId, username }: TombalaBoardProps) {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<Set<number>>(new Set());
  const [gameState, setGameState] = useState<any>(null);
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
    socket.emit('join_game_room', lobbyId);
    const handleGameStateUpdate = (state: any) => setGameState(state);
    socket.on('game_state_update', handleGameStateUpdate);
    return () => {
      socket.off('game_state_update', handleGameStateUpdate);
    };
  }, [socket, lobbyId]);

  const handleDrawNumber = () => {
    const available = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !drawnNumbers.has(n));
    if (available.length === 0) return;
    const num = available[Math.floor(Math.random() * available.length)];
    setDrawnNumbers(prev => new Set(prev).add(num));
  };

  const handleCellClick = (r: number, c: number) => {
    setBoard(prev => prev.map((row, ri) => row.map((cell, ci) => {
      if (ri === r && ci === c && cell.value !== null && drawnNumbers.has(cell.value)) {
        return { ...cell, marked: !cell.marked };
      }
      return cell;
    })));
  };

  const marksPerRow = board.map(row => row.filter(cell => cell.marked).length);
  const canCinko1 = marksPerRow.some(count => count === 5);
  const canCinko2 = marksPerRow.filter(count => count === 5).length >= 2;
  const canTombala = board.flat().filter(cell => cell.marked).length === 15;

  const handleClaim = (type: 'cinko1' | 'cinko2' | 'tombala') => {
    if (socket && username) {
      socket.emit('claim_win', { lobbyId, username, claimType: type, board });
    }
    const msgMap: Record<string,string> = {
      cinko1: '1. Çinko!',
      cinko2: '2. Çinko!',
      tombala: 'Tombala!'
    };
    setNotifMsg(msgMap[type]);
    setNotifOpen(true);
  };

  const handleNotifClose = () => setNotifOpen(false);

  const cellStyle = (cell: Cell) => ({
    height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid #bbb', cursor: cell.value && drawnNumbers.has(cell.value) ? 'pointer' : 'default',
    backgroundColor: cell.value === null ? '#f0f0f0' : cell.marked ? '#a5d6a7' : drawnNumbers.has(cell.value) ? '#90caf9' : '#fff'
  });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Button variant="contained" onClick={handleDrawNumber} disabled={drawnNumbers.size >= 90}>
          Sayı Çek
        </Button>
      </Box>
      <Paper elevation={3} sx={{ p: 2, backgroundColor: '#fafafa' }}>
        <Typography variant="h6" align="center" gutterBottom>
          Tombala Kartınız
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(9, 40px)', gridTemplateRows: 'repeat(3, 40px)', gap: 1, justifyContent: 'center' }}>
          {board.flatMap((row, ri) => row.map((cell, ci) => (
            <Box key={`${ri}-${ci}`} onClick={() => handleCellClick(ri, ci)} sx={cellStyle(cell)}>
              {cell.value !== null && <Typography variant="body2" fontWeight={500}>{cell.value}</Typography>}
            </Box>
          )))}
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Çekilen Sayılar: {Array.from(drawnNumbers).join(', ')}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
          <Button variant="contained" color="warning" onClick={() => handleClaim('cinko1')} disabled={!canCinko1}>1. ÇİNKO</Button>
          <Button variant="contained" color="secondary" onClick={() => handleClaim('cinko2')} disabled={!canCinko2}>2. ÇİNKO</Button>
          <Button variant="contained" color="error" onClick={() => handleClaim('tombala')} disabled={!canTombala}>TOMBALA</Button>
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
