import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Paper, Typography, Box, Button, Stack, Snackbar, Alert } from "@mui/material";
export function TombalaBoard({ socket, lobbyId, username }) {
    const [board, setBoard] = useState([]);
    const [drawnNumbers, setDrawnNumbers] = useState(new Set());
    const [gameState, setGameState] = useState(null);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifMsg, setNotifMsg] = useState("");
    // Initialize board with 3x9 and 15 numbers
    useEffect(() => {
        const generateNumbers = () => {
            const nums = [];
            while (nums.length < 15) {
                const r = Math.floor(Math.random() * 90) + 1;
                if (!nums.includes(r))
                    nums.push(r);
            }
            return nums.sort((a, b) => a - b);
        };
        const nums = generateNumbers();
        const matrix = Array.from({ length: 3 }, () => Array.from({ length: 9 }, () => ({ value: null, marked: false })));
        let idx = 0;
        for (let row = 0; row < 3; row++) {
            const positions = [];
            while (positions.length < 5) {
                const p = Math.floor(Math.random() * 9);
                if (!positions.includes(p))
                    positions.push(p);
            }
            positions.sort((a, b) => a - b).forEach(pos => {
                matrix[row][pos] = { value: nums[idx++], marked: false };
            });
        }
        setBoard(matrix);
    }, []);
    // Listen for server state
    useEffect(() => {
        if (!socket)
            return;
        socket.emit('join_game_room', lobbyId);
        const handleGameStateUpdate = (state) => setGameState(state);
        socket.on('game_state_update', handleGameStateUpdate);
        return () => {
            socket.off('game_state_update', handleGameStateUpdate);
        };
    }, [socket, lobbyId]);
    // Draw number manually
    const handleDrawNumber = () => {
        const available = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !drawnNumbers.has(n));
        if (available.length === 0)
            return;
        const num = available[Math.floor(Math.random() * available.length)];
        setDrawnNumbers(prev => new Set(prev).add(num));
    };
    // Toggle mark
    const handleCellClick = (r, c) => {
        setBoard(prev => prev.map((row, ri) => row.map((cell, ci) => {
            if (ri === r && ci === c && cell.value !== null && drawnNumbers.has(cell.value)) {
                return { ...cell, marked: !cell.marked };
            }
            return cell;
        })));
    };
    // Local win checks
    const marksPerRow = board.map(row => row.filter(cell => cell.marked).length);
    const canCinko1 = marksPerRow.some(count => count === 5);
    const canCinko2 = marksPerRow.filter(count => count === 5).length >= 2;
    const canTombala = board.flat().filter(cell => cell.marked).length === 15;
    // Claim with feedback
    const handleClaim = (type) => {
        if (socket && username) {
            socket.emit('claim_win', { lobbyId, username, claimType: type, board });
        }
        const msgMap = {
            cinko1: '1. Çinko talebiniz gönderildi!',
            cinko2: '2. Çinko talebiniz gönderildi!',
            tombala: 'Tombala talebiniz gönderildi!'
        };
        setNotifMsg(msgMap[type]);
        setNotifOpen(true);
    };
    const handleNotifClose = () => setNotifOpen(false);
    const cellStyle = (cell) => ({
        height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid #bbb', cursor: cell.value && drawnNumbers.has(cell.value) ? 'pointer' : 'default',
        backgroundColor: cell.value === null ? '#f0f0f0' : cell.marked ? '#a5d6a7' : drawnNumbers.has(cell.value) ? '#90caf9' : '#fff'
    });
    return (_jsxs(Box, { sx: { p: 2 }, children: [_jsx(Box, { sx: { mb: 2, textAlign: 'center' }, children: _jsx(Button, { variant: "contained", onClick: handleDrawNumber, disabled: drawnNumbers.size >= 90, children: "Say\u0131 \u00C7ek" }) }), _jsxs(Paper, { elevation: 3, sx: { p: 2, backgroundColor: '#fafafa' }, children: [_jsx(Typography, { variant: "h6", align: "center", gutterBottom: true, children: "Tombala Kart\u0131n\u0131z" }), _jsx(Box, { sx: { display: 'grid', gridTemplateColumns: 'repeat(9, 40px)', gridTemplateRows: 'repeat(3, 40px)', gap: 1, justifyContent: 'center' }, children: board.flatMap((row, ri) => row.map((cell, ci) => (_jsx(Box, { onClick: () => handleCellClick(ri, ci), sx: cellStyle(cell), children: cell.value !== null && _jsx(Typography, { variant: "body2", fontWeight: 500, children: cell.value }) }, `${ri}-${ci}`)))) }), _jsxs(Typography, { variant: "body2", sx: { mt: 2 }, children: ["\u00C7ekilen Say\u0131lar: ", Array.from(drawnNumbers).join(', ')] }), _jsxs(Stack, { direction: "row", spacing: 2, sx: { mt: 2, justifyContent: 'center' }, children: [_jsx(Button, { variant: "contained", color: "warning", onClick: () => handleClaim('cinko1'), disabled: !canCinko1, children: "1. \u00C7\u0130NKO" }), _jsx(Button, { variant: "contained", color: "secondary", onClick: () => handleClaim('cinko2'), disabled: !canCinko2, children: "2. \u00C7\u0130NKO" }), _jsx(Button, { variant: "contained", color: "error", onClick: () => handleClaim('tombala'), disabled: !canTombala, children: "TOMBALA" })] })] }), _jsx(Snackbar, { open: notifOpen, autoHideDuration: 3000, onClose: handleNotifClose, anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, children: _jsx(Alert, { onClose: handleNotifClose, severity: "success", sx: { width: '100%' }, children: notifMsg }) })] }));
}
