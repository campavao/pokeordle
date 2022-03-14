import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import './components/Guess.scss';

export function Instructions({ show = false, close }) {
    return (
        <Modal show={show} onHide={close} scrollable={true}>
            <Modal.Header closeButton>
                <Modal.Title>Welcome to Pokeordle!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <strong> How to play:</strong>
                <div>
                    Guess the Pokemon by matching types, generation, and/or
                    stats!
                    <br />
                    <br />
                    After each guess, the type(s)/generation/stats will change
                    colors to show how close your guess was to the correct
                    Pokemon.
                </div>
                <br />
                <div>
                    <strong>Generation:</strong>
                    <br />
                    <em>
                        Generation refers to the Generation where a Pokemon was
                        introduced. Pikachu = Gen 1, Mudkip = Gen 3, etc.
                    </em>
                    <br />
                    <br />
                    <div>
                        <span className="correct">Gen 1</span>
                        <div>Here Gen 1 is the correct Generation</div>
                        <br />
                    </div>
                    <div>
                        <span className="almost">Gen 3</span>
                        <div>Here Gen 3 is off by 1 Generation</div>
                        <br />
                    </div>
                    <div>
                        <span className="absent">Gen 5</span>
                        <div>Here Gen 5 is off by 2 or more Generations</div>
                    </div>
                </div>
                <br />
                <br />
                <div>
                    <strong>Types:</strong>
                    <br />
                    <em>
                        Types refers to a Pokemon's type(s). Some have only one,
                        while others have two.
                    </em>
                    <br />
                    <br />
                    <div style={{ display: 'flex' }}>
                        <li className="type-list-item correct-type">GRASS</li>
                        <li className="type-list-item absent-type">POISON</li>
                    </div>
                    <div>
                        Here GRASS is in the right position, but POISON is not.
                    </div>
                    <br />
                    <br />
                    <div style={{ display: 'flex' }}>
                        <li className="type-list-item absent-type">DRAGON</li>
                        <li className="type-list-item almost-type">FLYING</li>
                    </div>
                    <div>
                        Here FLYING is present in the Pokemon, but not in the
                        right position.
                    </div>
                    <br />
                    <br />
                    <div style={{ display: 'flex' }}>
                        <li className="type-list-item absent-type">BUG</li>
                        <li className="type-list-item absent-type">
                            <i class={`bi bi-question-lg`}></i>
                        </li>
                    </div>
                    <div>
                        Here the guess had only one type while the Pokemon has
                        two.
                    </div>
                    <br />
                    <br />
                    <div style={{ display: 'flex' }}>
                        <li className="type-list-item absent-type">NORMAL</li>
                        <li className="type-list-item mono-type">FAIRY</li>
                    </div>
                    <div>
                        Here the guess has two types, but the Pokemon only has
                        one.
                    </div>
                    <br />
                    <br />
                    <div style={{ display: 'flex' }}>
                        <li className="type-list-item absent-type">WATER</li>
                        <li className="type-list-item mono-type">
                            <i class={`bi bi-x-lg`}></i>
                        </li>
                    </div>
                    <div>
                        Here the guess AND the Pokemon only have one type.
                    </div>
                    <br />
                    <br />
                    <div>
                        <strong>Base Stat Total:</strong>
                        <br />
                        <em>
                            Base stat total refers to a Pokemon's combined base
                            stats: HP, Speed, Attack, Defense, Special Attack,
                            Special Defense.
                        </em>
                        <br />
                        <br />
                        <div>
                            <span className="correct">
                                405<i class="bi bi-arrow-up"></i>
                            </span>
                            <div>
                                Here 405 is within 20 points, but less than the
                                actual Base Stat Total.
                            </div>
                            <br />
                        </div>
                        <div>
                            <span className="almost">
                                275<i class="bi bi-arrow-up"></i>
                            </span>
                            <div>
                                Here 275 is within 100 points, but less than the
                                actual Base Stat Total.
                            </div>
                            <br />
                        </div>
                        <div>
                            <span className="absent">
                                600<i class="bi bi-arrow-down"></i>
                            </span>
                            <div>
                                Here 600 is not within 100 points, and is more
                                than the actual Base Stat Total.
                            </div>
                        </div>
                    </div>
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
