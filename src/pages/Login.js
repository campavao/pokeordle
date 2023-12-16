import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import './components/Guess.scss';

export function Login({ show = false, close }) {
    const [username, setUsername] = useState(
        localStorage.getItem('username') ?? ''
    );

    const saveUsername = (e) => {
        e.preventDefault();
        const newUserName = e.target?.[0]?.value;
        localStorage.setItem('username', newUserName);
        setUsername(username);
    };

    return (
        <Modal show={show} onHide={close} scrollable={true}>
            <Modal.Header closeButton style={{ flexDirection: 'column' }}>
                Current user
            </Modal.Header>
            <Modal.Body>
                {username === '' ? (
                    <form
                        onSubmit={saveUsername}
                        style={{
                            paddingBottom: '20px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <input
                            placeholder="enter username"
                            defaultValue={
                                localStorage.getItem('username') || ''
                            }
                        ></input>
                        <button type="submit" className="btn btn-light btn-sm">
                            Save
                        </button>
                    </form>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '20px',
                        }}
                    >
                        {username}{' '}
                        <button
                            className="btn btn-link btn-sm"
                            onClick={() => setUsername('')}
                            aria-label="change username"
                        >
                            <i class="bi bi-pen" />
                        </button>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={close}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
