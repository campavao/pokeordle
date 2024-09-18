import { Pokemon } from '../pokedex';
import SearchBar from './SearchBar';
import { FilterContainer } from './TypeFilter';

interface Props {
  filterState: any;
  handleFilterChange: (filterChange: any, key: any) => void;
  handleClick: (search: Pokemon) => void;
  disabled: boolean;
  onChange?: (search: string) => void;
}

export function SearchWithFilter({
  filterState,
  handleFilterChange,
  handleClick,
  onChange,
  disabled,
}: Props) {
  return (
    <div className="top-row">
      <FilterContainer
        filterState={filterState}
        updateFilterState={handleFilterChange}
      />
      <SearchBar
        onSubmit={handleClick}
        onChange={onChange}
        filter={filterState}
        disabled={disabled}
      />
    </div>
  );
}
