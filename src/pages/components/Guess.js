import { useEffect, useState, useRef } from 'react';
import { Popover, OverlayTrigger, ProgressBar } from 'react-bootstrap';

import { getImgUrl } from './utils';

import TypeList from './TypeList';

import './Guess.scss';

const generations = [
    {
        name: 'Gen 1',
        range: 151,
    },
    {
        name: 'Gen 2',
        range: 251,
    },
    {
        name: 'Gen 3',
        range: 386,
    },
    {
        name: 'Gen 4',
        range: 493,
    },
    {
        name: 'Gen 5',
        range: 649,
    },
    {
        name: 'Gen 6',
        range: 721,
    },
    {
        name: 'Gen 7',
        range: 809,
    },
];

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
                        {Object.entries(stats).map(([name, value]) => (
                            <li>
                                <p>
                                    {name}: {value}
                                </p>
                                <ProgressBar
                                    now={Math.round((value / 255) * 100)}
                                />
                            </li>
                        ))}
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
                                baseTotal.difference > 0 ? 'up' : 'down'
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
        const findGen = (gen, toFind) => {
            const foundIndex = toFind.index ? toFind.index : toFind;
            return foundIndex.id <= gen.range;
        };
        const guessGeneration = generations.find((gen) => findGen(gen, guess));
        const pokemonGeneration = generations.find((gen) =>
            findGen(gen, pokemon)
        );
        const difference = Math.abs(
            Number(guessGeneration.name.replace('Gen ', '')) -
                Number(pokemonGeneration.name.replace('Gen ', ''))
        );

        return (
            <div
                className={`generation ${
                    difference === 0
                        ? 'correct'
                        : difference === 1
                        ? 'almost'
                        : 'absent'
                }`}
            >
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
