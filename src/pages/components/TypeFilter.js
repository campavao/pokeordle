import types from './types.json';
import './Guess.scss';

export default function TypeFilter(props) {
    const { onClick, includedFilter = [], excludedFilter = [] } = props;

    return (
        <ul className="type-list">
            {types.map((type) => {
                const isExcluded = excludedFilter.includes(
                    type.english.toLowerCase()
                );
                const typeClassName = `
                ${
                    !includedFilter.includes(type.english.toLowerCase()) &&
                    'miss'
                }
                ${type.english.toLowerCase()}`;

                return (
                    <li key={type} style={{ listStyle: 'none' }}>
                        <button
                            onClick={onClick}
                            className={`type-list-item ${typeClassName}`}
                            disabled={isExcluded}
                        >
                            {type.english.toUpperCase()}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
