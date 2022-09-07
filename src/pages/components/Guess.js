import TypeList from './TypeList';
import './Guess.scss';

import { getImgUrl } from './utils';
import { useEffect, useState } from 'react';

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
        baseTotal: 0,
    };
    const [image, setImage] = useState('');

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
            baseTotal ? baseTotal.difference : 9999
        );
        const baseTotalClass = determineProximity(absTotalDifference);
        return (
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
        <div className="guess" key={name}>
            <Name />
            <Generation />
            <Types />
            <BaseTotal />
        </div>
    );
}
