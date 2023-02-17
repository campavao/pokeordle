import SearchBar from './SearchBar';
import { FilterContainer } from './TypeFilter';

export function SearchWithFilter({
    filterState,
    handleFilterChange,
    showHintButton = false,
    viewHint = false,
    setViewHint,
    handleClick,
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
                filter={filterState}
                disabled={disabled}
            />
            {showHintButton && (
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
