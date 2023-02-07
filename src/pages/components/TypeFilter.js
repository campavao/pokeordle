import types from './types.json';
import { sortBy } from 'lodash';
import './Guess.scss';

export default function TypeFilter(props) {
    const {
        onClick,
        includedFilter = [],
        excludedFilter = [],
        disabled,
    } = props;

    return (
        <ul className="type-list">
            {sortBy(types, (type) => {
                if (includedFilter.includes(type.english)) {
                    return -1;
                } else if (excludedFilter.includes(type.english)) {
                    return 1;
                } else {
                    return 0;
                }
            }).map((type, index) => {
                const isExcluded = excludedFilter.includes(type.english);
                const typeClassName = `
                ${!includedFilter.includes(type.english) && 'miss'}
                ${type.english.toLowerCase()}`;

                return (
                    <li key={type + index} style={{ listStyle: 'none' }}>
                        <button
                            onClick={onClick}
                            className={`type-list-item ${typeClassName} ${
                                isExcluded && 'excluded'
                            }`}
                            disabled={disabled}
                        >
                            {type.english}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
