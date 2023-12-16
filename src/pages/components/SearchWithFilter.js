import SearchBar from './SearchBar';
import { FilterContainer } from './TypeFilter';

export function SearchWithFilter({
    filterState,
    handleFilterChange,
    handleClick,
    onChange,
    disabled,
}) {
    return (
        <div className="top-row">
            <FilterContainer
                filterState={filterState}
                updateFilterState={handleFilterChange}
            />
            <SearchBar
                className="game-form"
                onSubmit={handleClick}
                onChange={onChange}
                filter={filterState}
                disabled={disabled}
            />
        </div>
    );
}
