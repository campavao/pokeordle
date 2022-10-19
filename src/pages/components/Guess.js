import { useEffect, useState, useRef } from 'react';
import { Popover, OverlayTrigger, ProgressBar } from 'react-bootstrap';

import { getImgUrl, determineGeneration } from './utils';

import TypeList from './TypeList';

import './Guess.scss';

export const determineProximity = (checkNum) => {
    return checkNum < 20 ? 'correct' : checkNum < 100 ? 'almost' : 'absent';
};

export default function Guess(props) {
    const {
        guess,
        pokemon,
        showArrows = false,
        showId = false,
        empty = false,
    } = props;
    const { name, index, types, baseTotal } = guess ?? {
        name: '?',
        index: 0,
        types: ['?', '?'],
        baseTotal: {
            total: 0,
            difference: 0,
            stats: null,
        },
    };
    const [image, setImage] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        async function updateImage() {
            const img = await getImgUrl(index.id);
            setImage(img);
        }
        if (index.id > 0) {
            updateImage();
        }
    }, [index]);

    if (empty) {
        return (
            <div className="guess" key="unknown">
                <Name empty />
                <Generation empty />
                <Types empty />
                <BaseTotal empty />
            </div>
        );
    }

    function Name({ empty }) {
        if (empty) {
            return <div className="name">?</div>;
        }

        const absIndexDifference = Math.abs(index.difference);
        const baseIndexClass = determineProximity(absIndexDifference);
        return (
            <div className="name">
                <div
                    className="game-answer"
                    style={{
                        backgroundImage: `url(${image?.default})`,
                    }}
                />
                {name}
                {showId && (
                    <span className={baseIndexClass}>
                        #{index.id}{' '}
                        {showArrows && (
                            <i
                                className={`bi bi-arrow-${
                                    index.difference > 0 ? 'up' : 'down'
                                }`}
                            ></i>
                        )}
                    </span>
                )}
            </div>
        );
    }

    function Types({ empty }) {
        return (
            <div className="types-container" aria-label="types">
                {!empty ? (
                    <TypeList
                        types={types}
                        useTypeColors={false}
                        possibleTypes={pokemon.type.length}
                    />
                ) : (
                    <ul className="type-list">
                        <li
                            key="unknown-1"
                            className="type-list-item absent-type"
                        >
                            <i class="bi bi-question-lg"></i>
                        </li>
                        <li
                            key="unknown-2"
                            className="type-list-item absent-type"
                        >
                            <i class="bi bi-question-lg"></i>
                        </li>
                    </ul>
                )}
            </div>
        );
    }

    function BaseTotal({ empty }) {
        const absTotalDifference = Math.abs(
            baseTotal.total ? baseTotal.difference : 9999
        );
        const baseTotalClass = determineProximity(absTotalDifference);
        const stats = baseTotal.stats;

        const popover = stats && (
            <Popover id="popover-basic" {...props}>
                <Popover.Body>
                    <ul
                        style={{
                            listStyle: 'none',
                            padding: '10px',
                            margin: '0',
                        }}
                    >
                        {Object.entries(stats).map(([name, value]) => {
                            const absStatDifference = Math.abs(
                                value - pokemon.base[name]
                            );
                            const statProximity =
                                determineProximity(absStatDifference);
                            const variant =
                                statProximity === 'correct'
                                    ? 'success'
                                    : statProximity === 'almost'
                                    ? 'warning'
                                    : 'dark';
                            return (
                                <li
                                    style={{
                                        marginBottom: '10px',
                                    }}
                                >
                                    {name}: {value}
                                    <ProgressBar
                                        now={value}
                                        max="255"
                                        variant={variant}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </Popover.Body>
            </Popover>
        );
        return (
            <OverlayTrigger
                trigger="click"
                overlay={popover}
                container={ref}
                placement="bottom"
            >
                <div className={`base-total ${baseTotalClass}`}>
                    Base stat total: {empty ? '?' : baseTotal.total}{' '}
                    {showArrows && !empty && (
                        <i
                            className={`bi bi-arrow-${
                                baseTotal.difference === 0
                                    ? ''
                                    : baseTotal.difference > 0
                                    ? 'up'
                                    : 'down'
                            }`}
                        ></i>
                    )}
                </div>
            </OverlayTrigger>
        );
    }

    function Generation({ empty }) {
        if (empty) {
            return <div className="generation absent">Gen ?</div>;
        }

        const { proximity, guessGeneration } = determineGeneration(
            guess,
            pokemon
        );

        return (
            <div className={`generation ${proximity}`}>
                {guessGeneration.name}
            </div>
        );
    }

    return (
        <div className="guess" key={name} ref={ref}>
            <Name />
            <Generation />
            <Types />
            <BaseTotal />
        </div>
    );
}
