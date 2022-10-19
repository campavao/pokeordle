import React, { useEffect, useRef, useState } from 'react';

import './Pages.scss';

function VoltorbFlip() {
    const [showInfo, setShowInfo] = useState(false);
    const [board, setBoard] = useState(null);
    const [currentIndex, setCurrentIndex] = useState({ x: 0, y: 0 });
    const totalRef = useRef();
    const voltorbsRef = useRef();

    useEffect(() => {
        if (!board) {
            initialize();
        }
    }, [board]);

    const initialize = () => {
        let tempBoard = {};
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                const value =
                    i === 5 || j === 5
                        ? {
                              total: 0,
                              voltorbs: 0,
                          }
                        : 0;
                const prevArr = tempBoard?.[i] ?? [];
                if (i === 5 && j === 5) {
                    console.log('only 1');
                } else {
                    tempBoard[i] = [...prevArr, value];
                }
            }
        }
        setBoard(tempBoard);
    };

    const openInfo = (index) => {
        console.log(index);
        setCurrentIndex(index);
        setShowInfo(true);
    };

    const updateInfo = () => {
        const { x, y } = currentIndex;
        board[x][y].total = totalRef.current.value;
        board[x][y].voltorbs = voltorbsRef.current.value;
        setBoard(board);
        setShowInfo(false);
    };

    console.log(board);

    return (
        <div style={{ background: 'white' }}>
            {showInfo && (
                <>
                    Row: {currentIndex.x}{' '}
                    <input id="total" placeholder="total" ref={totalRef} />
                    <input
                        id="voltorbs"
                        placeholder="voltorbs"
                        ref={voltorbsRef}
                    />
                    <button onClick={updateInfo}>Update</button>
                </>
            )}
            <table className="grid">
                {board &&
                    Object.entries(board).map(([x, yArray]) => {
                        return (
                            <tr>
                                {yArray.map((y, index) => (
                                    <td id={x}>
                                        {isNaN(y) ? (
                                            <div
                                                className="info"
                                                onClick={() =>
                                                    openInfo({ x, y: index })
                                                }
                                            >
                                                <div>Total: {y.total}</div>
                                                <div>Voltorb: {y.voltorbs}</div>
                                            </div>
                                        ) : (
                                            y
                                        )}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
            </table>
        </div>
    );
}

export default VoltorbFlip;
