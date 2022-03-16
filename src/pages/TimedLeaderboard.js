import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase.js';

export function TimedLeaderboard() {
    const [entries, setEntries] = useState([]);
    const [view, setView] = useState(15);

    useEffect(() => {
        async function getEntries() {
            const allEntries = await getDocs(
                collection(db, 'timed_leaderboard')
            );
            const entryList = allEntries.docs.map((doc) => doc.data());
            setEntries(entryList);
        }
        if (entries.length === 0) {
            getEntries();
        }
    }, [entries.length]);

    return (
        <div className="leaderboard">
            <h1>Timed Leaderboard</h1>
            <div className="start-buttons btn-group">
                <button
                    className={`btn ${
                        view === 15 ? 'btn-dark' : 'btn-outline-dark'
                    }`}
                    onClick={() => setView(15)}
                >
                    15 seconds
                </button>
                <button
                    className={`btn ${
                        view === 30 ? 'btn-dark' : 'btn-outline-dark'
                    }`}
                    onClick={() => setView(30)}
                >
                    30 seconds
                </button>
                <button
                    className={`btn ${
                        view === 60 ? 'btn-dark' : 'btn-outline-dark'
                    }`}
                    onClick={() => setView(60)}
                >
                    60 seconds
                </button>
            </div>
            <table className="table leaderboard-table">
                <thead>
                    <tr>
                        <th scope="col">Rank</th>
                        <th scope="col">User</th>
                        <th scope="col">Score</th>
                        {/* <th scope="col">Time</th> */}
                    </tr>
                </thead>
                <tbody>
                    {entries.length > 0 &&
                        entries
                            .filter((entry) => entry.time === view)
                            .sort(
                                (entry1, entry2) => entry2.score - entry1.score
                            )
                            .map((entry, index) => {
                                const { user, score } = entry;
                                return (
                                    <tr>
                                        <th scope="row">{index + 1}</th>
                                        <td>{user}</td>
                                        <td>{score}</td>
                                        {/* <td>{time}</td> */}
                                    </tr>
                                );
                            })}
                </tbody>
            </table>
        </div>
    );
}
