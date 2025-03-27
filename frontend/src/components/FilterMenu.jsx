import { useState } from "react";
import "./FilterMenu.modules.css";
import closeIcon from "../assets/images/close.png"; // Add your close icon path
import searchIcon from "../assets/images/search.png"; // Add your search icon path
import plusIcon from "../assets/images/plus.png"; // Add your plus icon path
import minusIcon from "../assets/images/minus.png"; // Add your minus icon path

const FilterMenu = ({ isOpen, closeFilterMenu }) => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (section) => {
    setOpenSections((prevSections) => ({
      ...prevSections,
      [section]: !prevSections[section],
    }));
  };

  const handleFilterChange = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((item) => item !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const applyFilters = () => {
    // Implement the filter logic
    console.log("Filters applied:", selectedFilters);
  };

  return (
    <div className={`filter-menu ${isOpen ? "open" : ""}`}>
      <img
        src={closeIcon}
        alt="Close"
        className="close-icon"
        onClick={closeFilterMenu}
      />
      <h3>Filters</h3>
      <div className="search-box2">
        <input type="text" placeholder="Search filters" />
        <img src={searchIcon} alt="Search" />
      </div>
      <div className="selected-filters">
        {selectedFilters.map((filter, index) => (
          <div className="selected-filter" key={index}>
            {filter}
            <img
              src={closeIcon}
              alt="Remove"
              onClick={() => handleFilterChange(filter)}
            />
          </div>
        ))}
      </div>
      <div className="filter-section">
        <h4 onClick={() => toggleSection("productType")}>
          Product Type
          <img
            src={openSections["productType"] ? minusIcon : plusIcon}
            alt="Toggle"
            className="toggle-icon"
          />
        </h4>
        <div
          className={`filter-options ${
            openSections["productType"] ? "open" : ""
          }`}
        >
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Hand Tools")}
              checked={selectedFilters.includes("Hand Tools")}
            />{" "}
            Hand Tools
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Power Tools")}
              checked={selectedFilters.includes("Power Tools")}
            />{" "}
            Power Tools
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() =>
                handleFilterChange("Personal Protective Equipment (PPE)")
              }
              checked={selectedFilters.includes(
                "Personal Protective Equipment (PPE)"
              )}
            />{" "}
            Personal Protective Equipment (PPE)
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Safety Signs and Labels")}
              checked={selectedFilters.includes("Safety Signs and Labels")}
            />{" "}
            Safety Signs and Labels
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("First Aid Kits")}
              checked={selectedFilters.includes("First Aid Kits")}
            />{" "}
            First Aid Kits
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Fire Safety Equipment")}
              checked={selectedFilters.includes("Fire Safety Equipment")}
            />{" "}
            Fire Safety Equipment
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Spill Control Products")}
              checked={selectedFilters.includes("Spill Control Products")}
            />{" "}
            Spill Control Products
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Fall Protection Equipment")}
              checked={selectedFilters.includes("Fall Protection Equipment")}
            />{" "}
            Fall Protection Equipment
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() =>
                handleFilterChange("Ergonomics and Lifting Equipment")
              }
              checked={selectedFilters.includes(
                "Ergonomics and Lifting Equipment"
              )}
            />{" "}
            Ergonomics and Lifting Equipment
          </label>
        </div>
      </div>
      <div className="filter-section">
        <h4 onClick={() => toggleSection("brand")}>
          Brand
          <img
            src={openSections["brand"] ? minusIcon : plusIcon}
            alt="Toggle"
            className="toggle-icon"
          />
        </h4>
        <div
          className={`filter-options ${openSections["brand"] ? "open" : ""}`}
        >
          {/* Add brand filters */}
        </div>
      </div>
      <div className="filter-section">
        <h4 onClick={() => toggleSection("priceRange")}>
          Price Range
          <img
            src={openSections["priceRange"] ? minusIcon : plusIcon}
            alt="Toggle"
            className="toggle-icon"
          />
        </h4>
        <div
          className={`filter-options ${
            openSections["priceRange"] ? "open" : ""
          }`}
        >
          {/* Add price range filters */}
        </div>
      </div>
      <div className="filter-section">
        <h4 onClick={() => toggleSection("material")}>
          Material
          <img
            src={openSections["material"] ? minusIcon : plusIcon}
            alt="Toggle"
            className="toggle-icon"
          />
        </h4>
        <div
          className={`filter-options ${openSections["material"] ? "open" : ""}`}
        >
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Metal")}
              checked={selectedFilters.includes("Metal")}
            />{" "}
            Metal
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Plastic")}
              checked={selectedFilters.includes("Plastic")}
            />{" "}
            Plastic
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Rubber")}
              checked={selectedFilters.includes("Rubber")}
            />{" "}
            Rubber
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Fabric")}
              checked={selectedFilters.includes("Fabric")}
            />{" "}
            Fabric
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Composite")}
              checked={selectedFilters.includes("Composite")}
            />{" "}
            Composite
          </label>
        </div>
      </div>
      <div className="filter-section">
        <h4 onClick={() => toggleSection("userRatings")}>
          User Ratings
          <img
            src={openSections["userRatings"] ? minusIcon : plusIcon}
            alt="Toggle"
            className="toggle-icon"
          />
        </h4>
        <div
          className={`filter-options ${
            openSections["userRatings"] ? "open" : ""
          }`}
        >
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("1 Star and Up")}
              checked={selectedFilters.includes("1 Star and Up")}
            />{" "}
            1 Star and Up
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("2 Stars and Up")}
              checked={selectedFilters.includes("2 Stars and Up")}
            />{" "}
            2 Stars and Up
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("3 Stars and Up")}
              checked={selectedFilters.includes("3 Stars and Up")}
            />{" "}
            3 Stars and Up
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("4 Stars and Up")}
              checked={selectedFilters.includes("4 Stars and Up")}
            />{" "}
            4 Stars and Up
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("5 Stars")}
              checked={selectedFilters.includes("5 Stars")}
            />{" "}
            5 Stars
          </label>
        </div>
      </div>
      <div className="filter-section">
        <h4 onClick={() => toggleSection("color")}>
          Color
          <img
            src={openSections["color"] ? minusIcon : plusIcon}
            alt="Toggle"
            className="toggle-icon"
          />
        </h4>
        <div
          className={`filter-options ${openSections["color"] ? "open" : ""}`}
        >
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Red")}
              checked={selectedFilters.includes("Red")}
            />{" "}
            Red
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Blue")}
              checked={selectedFilters.includes("Blue")}
            />{" "}
            Blue
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Green")}
              checked={selectedFilters.includes("Green")}
            />{" "}
            Green
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Yellow")}
              checked={selectedFilters.includes("Yellow")}
            />{" "}
            Yellow
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Black")}
              checked={selectedFilters.includes("Black")}
            />{" "}
            Black
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("White")}
              checked={selectedFilters.includes("White")}
            />{" "}
            White
          </label>
        </div>
      </div>
      <div className="filter-section">
        <h4 onClick={() => toggleSection("size")}>
          Size
          <img
            src={openSections["size"] ? minusIcon : plusIcon}
            alt="Toggle"
            className="toggle-icon"
          />
        </h4>
        <div className={`filter-options ${openSections["size"] ? "open" : ""}`}>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Small")}
              checked={selectedFilters.includes("Small")}
            />{" "}
            Small
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Medium")}
              checked={selectedFilters.includes("Medium")}
            />{" "}
            Medium
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Large")}
              checked={selectedFilters.includes("Large")}
            />{" "}
            Large
          </label>
          <label>
            <input
              type="checkbox"
              onChange={() => handleFilterChange("Extra Large")}
              checked={selectedFilters.includes("Extra Large")}
            />{" "}
            Extra Large
          </label>
        </div>
      </div>
      <div className="filter-button2-container">
        <button className="filter-button2" onClick={applyFilters}>
          Filter
        </button>
      </div>
    </div>
  );
};

export default FilterMenu;
