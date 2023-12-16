import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase.js';

export function TimedLeaderboard() {
    const [entries, setEntries] = useState([]);
    const [view, setView] = useState(15);
    const [useGen1, setGen1] = useState(false);

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

    const handleViewChange = (view, gen1 = false) => {
        setView(view);
        setGen1(gen1)
    }

    return (
        <div className="leaderboard">
            <h1>Timed Leaderboard</h1>
            <div className="start-buttons btn-group">
                <button
                    className={`btn ${
                        view === 15 && useGen1 ? 'btn-dark' : 'btn-outline-dark'
                    }`}
                    onClick={() => handleViewChange(15, true)}
                >
                    15 sec <p>(Gen 1)</p>
                </button>
                <button
                    className={`btn ${
                        view === 30 && useGen1 ? 'btn-dark' : 'btn-outline-dark'
                    }`}
                    onClick={() => handleViewChange(30, true)}
                >
                    30 sec <p>(Gen 1)</p>
                </button>
                <button
                    className={`btn ${
                        view === 60 && useGen1 ? 'btn-dark' : 'btn-outline-dark'
                    }`}
                    onClick={() => handleViewChange(60, true)}
                >
                    60 sec <p>(Gen 1)</p>
                </button>
                <button
                    className={`btn ${
                        view === 15 && !useGen1 ? 'btn-dark' : 'btn-outline-dark'
                    }`}
                    onClick={() => handleViewChange(15)}
                >
                    15 sec <p>(All)</p>
                </button>
                <button
                    className={`btn ${
                        view === 30 && !useGen1 ? 'btn-dark' : 'btn-outline-dark'
                    }`}
                    onClick={() => handleViewChange(30)}
                >
                    30 sec <p>(All)</p>
                </button>
                <button
                    className={`btn ${
                        view === 60 && !useGen1 ? 'btn-dark' : 'btn-outline-dark'
                    }`}
                    onClick={() => handleViewChange(60)}
                >
                    60 sec <p>(All)</p>
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
                            .filter((entry) => useGen1 ? entry.gen === '1' : (!entry.gen || entry.gen === 'all'))
                            .sort(
                                (entry1, entry2) => entry2.score - entry1.score
                            )
                            .map((entry, index) => {
                                const { user, score } = entry;
                                return (
                                    <tr>
                                        <th scope="row">{index + 1}</th>
                                        <td title={user}>{user}</td>
                                        <td>{score}</td>
                                        {/* <td>{date}</td> */}
                                    </tr>
                                );
                            })}
                </tbody>
            </table>
        </div>
    );
}
