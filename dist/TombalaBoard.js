import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";
/**
 * Basit bir 3×9 Tombala kartı bileşeni.
 * Her satırda 5 rastgele sayı yer alır, geri kalan hücreler boş (null).
 * Hücreler tıklanınca “işaretlenir” (marked: true).
 */
export function TombalaBoard() {
    // 1..90 arasında 15 benzersiz sayı üretir:
    const generateNumbers = () => {
        const nums = [];
        while (nums.length < 15) {
            const r = Math.floor(Math.random() * 90) + 1;
            if (!nums.includes(r))
                nums.push(r);
        }
        return nums.sort((a, b) => a - b);
    };
    const [board, setBoard] = useState([]);
    useEffect(() => {
        const nums = generateNumbers(); // Örneğin [3, 7, 15, … 88]
        const matrix = [];
        let idx = 0;
        for (let row = 0; row < 3; row++) {
            const rowNums = nums.slice(idx, idx + 5);
            idx += 5;
            // 9 hücreli satır, başta hepsi boş (null) ve işaretlenmemiş (false):
            const cells = Array.from({ length: 9 }).map(() => ({
                value: null,
                marked: false,
            }));
            // Rastgele 5 pozisyon seç ve sayıları yerleştir:
            const positions = [];
            while (positions.length < 5) {
                const p = Math.floor(Math.random() * 9);
                if (!positions.includes(p))
                    positions.push(p);
            }
            positions.sort((a, b) => a - b).forEach((pos, i) => {
                cells[pos] = { value: rowNums[i], marked: false };
            });
            matrix.push(cells);
        }
        setBoard(matrix);
    }, []);
    // Hücre tıklanınca onay işaretini (marked) toggle et:
    const handleCellClick = (r, c) => {
        setBoard((prev) => prev.map((row, ri) => row.map((cell, ci) => {
            if (ri === r && ci === c && cell.value !== null) {
                return { value: cell.value, marked: !cell.marked };
            }
            return cell;
        })));
    };
    // Hücre stilini MUI sx üzerinden ayarla:
    const cellStyle = (cell) => ({
        height: 40,
        width: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #bbb",
        backgroundColor: cell.value === null ? "#f0f0f0" : cell.marked ? "#90caf9" : "#fff",
        cursor: cell.value !== null ? "pointer" : "default",
    });
    return (_jsxs(Paper, { elevation: 3, sx: { p: 2, backgroundColor: "#fafafa" }, children: [_jsx(Typography, { variant: "h6", align: "center", gutterBottom: true, children: "Tombala Kart\u0131" }), _jsx(Box, { children: _jsx(Grid, { container: true, spacing: 0, children: board.map((row, ri) => row.map((cell, ci) => (_jsx(Grid, { size: "auto", children: _jsx(Box, { sx: cellStyle(cell), onClick: () => handleCellClick(ri, ci), children: cell.value !== null ? (_jsx(Typography, { variant: "body2", fontWeight: 500, children: cell.value })) : null }) }, `${ri}-${ci}`)))) }) })] }));
}
