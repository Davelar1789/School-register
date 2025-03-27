import "./FilterButton.css";
import filterIcon from "../assets/images/filter.png";

const FilterButton = ({ toggleFilterMenu }) => (
  <div className="filter-button" onClick={toggleFilterMenu}>
    <img src={filterIcon} alt="Filter Icon" className="filter-icon" />
    <span>Filter</span>
  </div>
);

export default FilterButton;
