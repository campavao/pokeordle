import SearchBar from './SearchBar';
import { FilterContainer } from './TypeFilter';

export function SearchWithFilter({
    filterState,
    handleFilterChange,
    hasWon = false,
    viewHint = false,
    setViewHint,
    handleClick,
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
                filter={filterState}
                disabled={hasWon}
            />
            {viewHint && (
                <button
                    type="button"
                    class="btn btn-outline-dark btn-sm game-hint-button"
                    onClick={() => setViewHint(!viewHint)}
                >
                    {viewHint ? 'Hide' : 'Show'} hint
                </button>
            )}
        </div>
    );
}
