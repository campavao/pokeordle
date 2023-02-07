import types from './types.json';
import './Guess.scss';

export default function TypeFilter(props) {
    const {
        onClick,
        includedFilter = [],
        excludedFilter = [],
        disabled,
    } = props;

    return (
        <table className="type-list">
            <tr>
                <th>Included</th>
                <th>Not Selected</th>
                <th>Excluded</th>
            </tr>
            <tr>
                <TypeRow
                    list={types.filter((type) =>
                        includedFilter.includes(type.english)
                    )}
                    {...props}
                />
                <TypeRow
                    list={types.filter(
                        (type) =>
                            !includedFilter.includes(type.english) &&
                            !excludedFilter.includes(type.english)
                    )}
                    {...props}
                />
                <TypeRow
                    list={types.filter((type) =>
                        excludedFilter.includes(type.english)
                    )}
                    {...props}
                />
            </tr>
        </table>
    );
}

function TypeRow({
    list = [],
    includedFilter,
    excludedFilter,
    onClick,
    disabled,
}) {
    console.log(list);
    return (
        <td>
            {list.map((type, index) => {
                const isExcluded = excludedFilter.includes(type.english);
                const typeClassName = `
                ${!includedFilter.includes(type.english) && 'miss'}
                ${type.english.toLowerCase()}`;

                return (
                    <button
                        key={type + index}
                        onClick={onClick}
                        className={`type-list-item ${typeClassName} ${
                            isExcluded && 'excluded'
                        }`}
                        disabled={disabled}
                    >
                        {type.english}
                    </button>
                );
            })}
        </td>
    );
}
