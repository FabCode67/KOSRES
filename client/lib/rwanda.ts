/**
 * All 30 districts of Rwanda grouped by province.
 * Used across service request forms.
 */

export const RWANDA_DISTRICTS = [
  "Gasabo",
  "Kicukiro",
  "Nyarugenge",
  "Burera",
  "Gakenke",
  "Gicumbi",
  "Musanze",
  "Rulindo",
  "Bugesera",
  "Gatsibo",
  "Kayonza",
  "Kirehe",
  "Ngoma",
  "Nyagatare",
  "Rwamagana",
  "Gisagara",
  "Huye",
  "Muhanga",
  "Nyamagabe",
  "Nyanza",
  "Nyaruguru",
  "Ruhango",
  "Karongi",
  "Ngororero",
  "Nyabihu",
  "Nyamasheke",
  "Rubavu",
  "Rusizi",
  "Rutsiro",
]

/**
 * All 30 districts grouped by province — for grouped-select fields.
 */
export const RWANDA_DISTRICTS_BY_PROVINCE = [
  {
    groupLabel: "KIGALI CITY",
    items: ["Gasabo", "Kicukiro", "Nyarugenge"],
  },
  {
    groupLabel: "NORTHERN PROVINCE",
    items: ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
  },
  {
    groupLabel: "EASTERN PROVINCE",
    items: ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"],
  },
  {
    groupLabel: "SOUTHERN PROVINCE",
    items: ["Gisagara", "Huye", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"],
  },
  {
    groupLabel: "WESTERN PROVINCE",
    items: ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"],
  },
]

/**
 * All property types grouped by category.
 * Used across service request forms.
 */
export const PROPERTY_TYPE_GROUPS = [
  {
    groupLabel: "RESIDENTIAL",
    items: ["Flats", "Single Family Home", "Town House", "Duplex", "Villa", "G+1"],
  },
  {
    groupLabel: "COMMERCIAL",
    items: [
      "Office", "Shop", "Showroom", "Hotel", "Guest House",
      "Bar & Restaurant", "Fuel Station", "Factory",
      "Distribution Center", "Commercial Land",
    ],
  },
  {
    groupLabel: "AGRICULTURAL",
    items: ["Farmland", "Crop Plantation", "Green House"],
  },
  {
    groupLabel: "INDUSTRIAL",
    items: ["Industrial Land", "Factory", "Warehouse", "Distribution Center"],
  },
]
