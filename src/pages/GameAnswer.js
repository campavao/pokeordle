import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { useDailyGame } from './hooks/useDailyGame';

export function GameAnswer({ show = false, close }) {
    const { pokemon, currStreak, handleShare } = useDailyGame('hardGameState');
    return (
        <Modal show={show} onHide={close} scrollable={true}>
            <Modal.Header closeButton style={{ flexDirection: 'column' }}>
                <Modal.Title>You won!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="game-reveal">
                    <h2>The Pokemon was {pokemon?.name?.english}!</h2>
                    Current Streak: {currStreak}
                    {pokemon.img && (
                        <div
                            className="game-answer"
                            aria-label={pokemon?.name?.english}
                            style={{
                                backgroundImage: `url(${pokemon.img?.default})`,
                            }}
                        />
                    )}
                    <button
                        className="type-list-item correct-type"
                        onClick={handleShare}
                    >
                        Share
                    </button>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={close}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
