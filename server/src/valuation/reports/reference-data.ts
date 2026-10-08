// GENERATED from ZONING_DATA.xlsx and BASES_OF_VALUE__ASSUMPTIONS__APPROACHES.xlsx.
// Reference text used by the Word valuation report. Edit here (or move to the
// database later) -- the report generator reads only these exports.

export type ZoningCategory = {
  group: string | null;
  category: string;
  code: string | null;
  description: string;
  permitted: string[];
  prohibited: string[];
};

export type NamedText = { name: string; description: string };

export const ZONING_CATEGORIES: ZoningCategory[] = [
  {
    "group": "RESIDENTIAL",
    "category": "Low Density Residential zone (R1)",
    "code": "R1",
    "description": "The Low-Density Residential Zone (R1) is intended for villa and bungalow typology and complementary public facilities as needed. R1 Zones are limited in the City of Kigali to existing consolidated areas with the objective of limiting low-density urban development and encouraging compact development. In all R1 Zones, R1A regulations are permitted.",
    "permitted": [
      "Single family houses",
      "Home Occupation",
      "Uses as per R1A regulations"
    ],
    "prohibited": [
      "Industrial uses",
      "Major infrastructure"
    ]
  },
  {
    "group": "RESIDENTIAL",
    "category": "Low Density Residential Densification Zone (R1A)",
    "code": "R1A",
    "description": "The Low-Density Residential Densification Zone (R1A) is a residential zone for semidetached houses, single family townhouses, multifamily Houses, and low-rise developments. The R1A zone is intended to offer low and medium-rise housing and complementary commercial and public facilities as needed. The lot sizes in the R1A zone are smaller than in Low Density Residential Zones (R1), to distinguish the R1A zone as a higher density low rise residential neighbourhood. The purpose is to promote more efficient use of the lands in prime areas of the City by allowing for intensification and mix of uses of the existing low-density housing development.",
    "permitted": [
      "Single family houses (all types)",
      "Semi-detached houses",
      "Multifamily Houses",
      "Townhouses",
      "Row houses",
      "Home Occupation",
      "Accessory Residential Units"
    ],
    "prohibited": [
      "Residential exceeding G + 2",
      "Industrial uses",
      "Major infrastructure"
    ]
  },
  {
    "group": "RESIDENTIAL",
    "category": "Rural Residential Zone (R1B)",
    "code": "R1B",
    "description": "The Rural Residential Zone (R1B) is a residential zone offering compact developments in rural areas. The R1B Zone is intended to offer low rise housing as part of the farming community and complementary public facilities as needed. The purpose is to create a sustainable and compact residential settlement in the rural areas of the City, limiting encroachment towards the fertile agricultural land.",
    "permitted": [
      "Single family Houses",
      "Row housing",
      "Multifamily residential (4 in 1, 8 in 1, etc) as per IDP model",
      "Villages)",
      "Low-rise apartments",
      "Home Occupation",
      "Accessory Residential Units"
    ],
    "prohibited": [
      "Industrial uses",
      "Major infrastructure"
    ]
  },
  {
    "group": "RESIDENTIAL",
    "category": "Medium Density Residential - Improvement Zone (R2)",
    "code": "R2",
    "description": "The Medium Density Residential - Improvement Zone (R2) is essentially planned for upgradation of unplanned settlements or redevelopment of urban renewal areas, wherever feasible in the brown field sites. Variety in the housing types and planned development is expected to stimulate the upgrading, redevelopment, and intensification of these housing areas. Its intent is to improve the overall physical and living conditions of the identified unplanned settlements in Kigali, through upgradation in the short term, and redevelopment through land assembly in the medium-long term, to better utilize the developable land in prime areas of the city for creating integrated and affordable neighbourhoods and provide adequate infrastructure and public facilities.",
    "permitted": [
      "Row housing",
      "Low Rise apartments",
      "Home Occupation",
      "Accessory Residential Units"
    ],
    "prohibited": [
      "Major Industrial uses",
      "Major infrastructure",
      "Single Family Residential Developments"
    ]
  },
  {
    "group": "RESIDENTIAL",
    "category": "Medium Density Residential - Expansion Zone (R3)",
    "code": "R3",
    "description": "The Medium Density Residential - Expansion Zone (R3) is established to allow for intensification and redevelopment of peri-urban and green field areas through extensive housing strategies to provide variety of housing solutions. This zone is expected to stimulate development of low-cost incremental housing in special redevelopment or greenfield areas. The purpose of R3 zone is to facilitate the provision of housing dedicated to the low-income segment of the population, by providing low-rise, higher-intensity developments in green field sites of the City. To ensure mix of use and mix of income, several housing solutions are allowed. The R3 Zones are located in peri-urban areas, in close proximity to the proposed transit corridors, hence a minimum development quantum is required. In all R3 Zones, R2 regulations are permitted.",
    "permitted": [
      "Single family Residential",
      "Rowhouses",
      "Low-rise apartments",
      "Multifamily Houses",
      "Accessory Residential units",
      "Home Occupation"
    ],
    "prohibited": [
      "Industrial uses",
      "Major infrastructure",
      "Any development that does not meet affordability criteria",
      "suggested in these regulations."
    ]
  },
  {
    "group": "RESIDENTIAL",
    "category": "High Density Residential Zone (R4)",
    "code": "R4",
    "description": "The High-Density Residential Zone (R4) is established to create well planned medium-rise housing and apartment complexes with integrated commercial and public facilities, open spaces etc. Minimum lot sizes in the High-Density Residential Zone (R4) are higher than the Medium Density Residential Zone (R3). This is to facilitate the creation of a wellplanned high-density residential mixed-use neighbourhood with green character.",
    "permitted": [
      "High density residential",
      "Home Occupation",
      "R2 typologies in case plot size is less than 750 m2"
    ],
    "prohibited": [
      "Industrial uses",
      "Major infrastructure"
    ]
  },
  {
    "group": "Mixed-Use and Commercial",
    "category": "Mixed Use Zone (C1)",
    "code": "C1",
    "description": "The Mixed-Use Zone (C1) is a zone established to create high flexibility in the mix of uses and ensure continuity in the ground level commercial activities as well as provide employment opportunities in other floors such as offices or accommodation. This Zone offers spaces for goods and services as well as living quarters and rental units to create a vibrant mixed use commercial zone.",
    "permitted": [
      "Commercial / Retail",
      "Restaurants and Recreational activities",
      "Office use above the 1st floor",
      "Co-working spaces",
      "Residential",
      "Home Occupation"
    ],
    "prohibited": [
      "Large scale commercial complex",
      "Industrial Uses",
      "Major Infrastructure Installations"
    ]
  },
  {
    "group": "Mixed-Use and Commercial",
    "category": "Neighbourhood Commercial Zone Overlay (O-C2)",
    "code": "O-C2",
    "description": "The Neighbourhood Commercial Zone Overlay (O-C2) within residential zones creates attractive establishments and such developments along minor arterial and collector roads allow for compact and active mixed-use developments with a commercial frontage.",
    "permitted": [
      "Neighbourhood level",
      "Commercial retail",
      "Retail",
      "Offices",
      "Hotels",
      "Micro-Enterprise",
      "Co-working spaces"
    ],
    "prohibited": [
      "All types of industrial uses",
      "Large scale commercial uses such as shopping centres, hypermarts, showrooms, etc.",
      "Major infrastructure"
    ]
  },
  {
    "group": "Mixed-Use and Commercial",
    "category": "City Commercial Zone (C3)",
    "code": "C3",
    "description": "The City Commercial Zone (C3) is a Zone established to meet most of the retail, commercial and services needs for the larger community, and may include offices and entertainment activities. The minimum lot size is set at 1,000 m2 to allow for well-designed commercial buildings and to ensure that each development will be able to comply with C3 requirements.",
    "permitted": [
      "Developments allowed in the C1 zone",
      "Shopping centres",
      "Offices",
      "Hotels",
      "Apartments",
      "Leisure and entertainment centres (e.g. cinemas,",
      "bowling alleys)",
      "Galleries",
      "Education Institutions",
      "Coworking spaces"
    ],
    "prohibited": [
      "Major Industrial Uses",
      "Major Infrastructure Installations"
    ]
  },
  {
    "group": "Mixed-Use and Commercial",
    "category": "Public Administrative and Services Zone (PA)",
    "code": "PA",
    "description": "This zone is designated for Public Administration and Services (PA) and shall only apply to lands owned by governmental agencies for public use or benefit. The PA zone applies to lands identified on the land use map as government offices or any other publicly owned properties as listed in the table below. Other publicly owned lands not included within the PA zone shall be subject to the development standards of the zone in which they are located. Whenever the public use in the PA zone ceases, or the plot affected by PA zone is sold to private individuals, such zone may be developed following Zoning Regulations of the neighbouring areas without having to apply for zoning variation. In the case where several classes of zones are present near such parcel, CoK – OSC, at its discretion will establish which zoning regulations shall be applied.",
    "permitted": [
      "Government offices",
      "Correctional and rehabilitation facilities",
      "Defence and security uses",
      "Fire station",
      "Police station",
      "Transport Interchange",
      "Other public uses"
    ],
    "prohibited": [
      "Major industrial uses and warehouses",
      "Major commercial uses",
      "Public utility maintenance facilities with outdoor storage of",
      "materials and supplies"
    ]
  },
  {
    "group": "Public Facilities",
    "category": "PF1 - Public Facilities Zone-Education and Research",
    "code": "PF1",
    "description": "These regulations shall apply to: • All education and research facilities within the Public Facilities Zone (PF1) • Lots zoned or re-zoned as education and research facilities within Public Facilities Zone (PF1)",
    "permitted": [
      "All types of educational institutes",
      "Research facilities"
    ],
    "prohibited": [
      "Industrial uses and warehouses",
      "Major commercial uses",
      "Public utility maintenance facilities with outdoor storage of",
      "materials and supplies",
      "Cemeteries/crematoriums"
    ]
  },
  {
    "group": "Public Facilities",
    "category": "PF2 - Public Facilities Zone -Health",
    "code": "PF2",
    "description": "These regulations shall apply to: • All health facilities within the Public Facilities Zone (PF2) • Lots zoned or re-zoned as health facilities within Public Facilities Zone (PF2)",
    "permitted": [
      "All types of health facilities",
      "Pharmacy"
    ],
    "prohibited": [
      "Industrial uses and warehouses",
      "Major commercial uses",
      "Public utility maintenance facilities with outdoor storage of",
      "materials and supplies",
      "Cemeteries/crematoriums"
    ]
  },
  {
    "group": "Public Facilities",
    "category": "PF3-Public Facilities Zone -Religious",
    "code": "PF3",
    "description": "These regulations shall apply to: • All religious facilities within the Public Facilities Zone (PF3) • Lots zoned or re-zoned as religious facilities within Public Facilities Zone (PF3)",
    "permitted": [
      "All types of Religious facilities"
    ],
    "prohibited": [
      "Industrial uses and warehouses",
      "Major commercial uses",
      "Public utility maintenance facilities with outdoor storage of",
      "materials and supplies",
      "Cemeteries/crematoriums"
    ]
  },
  {
    "group": "Public Facilities",
    "category": "PF4-Public Facilities Zone-Cultural/Memorial",
    "code": "PF4",
    "description": "These regulations shall apply to: • All Cultural/ memorial sites within the Public Facilities Zone (PF4) • Lots zoned or re-zoned as Cultural/ memorial sites within Public Facilities Zone (PF4)",
    "permitted": [
      "Cultural centres and sites",
      "Neighbourhood Centre",
      "Neighbourhood Park",
      "Museums",
      "Community halls",
      "Libraries",
      "Memorial sites"
    ],
    "prohibited": [
      "Industrial uses and warehouses",
      "Major commercial uses",
      "Public utility maintenance facilities with outdoor storage of",
      "materials and supplies",
      "Cemeteries/crematoriums"
    ]
  },
  {
    "group": "Public Facilities",
    "category": "PF5-Public Facilities Zone – Cemetery/Crematoria",
    "code": "PF5",
    "description": "These regulations shall apply to: • All Cemetery/ Crematoria sites within the Public Facilities Zone (PF5) • Lots zoned or re-zoned as Cemetery/ Crematoria sites within Public Facilities Zone (PF5)",
    "permitted": [
      "Cemetery",
      "Crematoria",
      "Other facilities such as pavilions, service rooms,"
    ],
    "prohibited": [
      "All Industrial uses",
      "All commercial uses",
      "All Residential uses",
      "Public utility maintenance facilities with outdoor storage of",
      "materials and supplies"
    ]
  },
  {
    "group": "Industrial",
    "category": "Light Industrial Zone (I1)",
    "code": "I1",
    "description": "The Light Industrial Zone (I1) is specialised land areas carefully located close to residential area with easy vehicular access to offer residents’ proximity to a range of non-polluting industrial services. It is also established to create a clean and light industrial environment that could blend with the surrounding residential area. I1 zone can have Clean Industries, Business Parks, Light Industries, or retail warehouses.",
    "permitted": [
      "Non-pollutive industrial uses such as:",
      "Agricultural processing plants",
      "Industrial Bakeries",
      "Building material and lumber storage",
      "Cabinetmaking and carpenter workshops",
      "Petrol stations",
      "Food processing (except fish, dairy, poultry and meat products,",
      "sauerkraut, vinegar, yeast and rendering of fats and oils)",
      "Fruit or vegetable packing plants",
      "Laboratories for research and development",
      "Light manufacturing and assembly",
      "Car wash",
      "Machine shops",
      "Mechanized equipment storage and sale",
      "Non-hazardous material, bulk storage and related uses",
      "Sheet metal shops",
      "Storage building for household goods",
      "Automotive repair shops",
      "Wholesale and warehousing",
      "Dry cleaning / laundry service",
      "Business Parks, Science Parks",
      "N.B. the full list of allowed uses is appended in Annex I"
    ],
    "prohibited": [
      "Residential Uses not related to other activities present on the",
      "site",
      "Major Infrastructure Installations"
    ]
  },
  {
    "group": "Industrial",
    "category": "General Industrial Zone (I2)",
    "code": "I2",
    "description": "The General Industrial Zone (I2) is specialised land areas strategically located close to expressways for easy access for heavy vehicles. As it is a zone that can generate noise, traffic, and pollutants, it is kept away from residential areas. It is established to create a consolidated industrial zone for employment in manufacturing and logistics industries, with imposed nuisance buffer for noise and health safety. I2 zone can have General Industries or Specialized Industries depending on their pollutive nature. Depending on the type of industry, different buffer requirements apply for General Industries.",
    "permitted": [
      "All uses allow in I1 – Light Industrial Zone",
      "Batching and mixing plants, asphalt, cement, and concrete",
      "Manufacturing",
      "Brewing or distilling of liquor",
      "Building wreckers and house mover storage yards",
      "Foundries",
      "Manufacture of paper products",
      "Storage of oil, gasoline or petroleum products in any quantity",
      "exceeding 3,500 Cubic Meters (m³) on any one lot or parcel of",
      "land",
      "Structural steel fabrication"
    ],
    "prohibited": [
      "Residential Uses",
      "Major Infrastructure Installations"
    ]
  },
  {
    "group": "Industrial",
    "category": "Mining and Quarrying Industrial Zone (I3)",
    "code": "I3",
    "description": "The Mining and Quarry Industrial Zone (I3) is specialised land areas that may be identified within the City boundary for economic benefit. The intent is to regulate their use for sustainable extraction and restoration practices and to protect the environment and people from disaster and health risks.",
    "permitted": [
      "Mining",
      "Quarrying including clay extraction",
      "Brick Kilns",
      "Operations and Crushing Plants",
      "Other mining related activities"
    ],
    "prohibited": [
      "Residential Uses",
      "Commercial Uses",
      "Major Infrastructure Installations"
    ]
  },
  {
    "group": "Nature and Open Spaces",
    "category": "Parks and Open Spaces Zone (P1)",
    "code": "P1",
    "description": "Parks and Open Spaces Zone (P1) are established to provide recreational and leisure facilities and activities in selected areas that have unique features (including visual corridors, environmentally sensitive areas, buffer areas, or along significant routes). Parks and open spaces can include recreational, small commercial or public facilities",
    "permitted": [
      "Botanical gardens, arboretums, and conservatories.",
      "Outdoor recreational facilities, such as hiking and",
      "bicycle trails, greens, and commons, sitting areas and",
      "picnic areas.",
      "Park related public facilities such as public toilet/",
      "changing room."
    ],
    "prohibited": [
      "All types of industrial uses",
      "All types of residential uses",
      "Commercial uses exceeding what prescribed at point",
      "1.3 below",
      "All types of major public facilities",
      "Major infrastructure installations"
    ]
  },
  {
    "group": "Nature and Open Spaces",
    "category": "Sports and Eco-Tourism Zone (P2)",
    "code": "P2",
    "description": "The Sports and Eco-Tourism Zone (P2) is established to provide parks that offer active recreational uses with sporting facilities and forests with eco-tourism activities. Cultural Facilities such as Museums, Art Centres and Concert Halls are also allowed in this zone.",
    "permitted": [
      "Sports Complexes",
      "Theme Parks",
      "Resort Hotels",
      "Camping Site",
      "Golf Courses",
      "Recreational Clubs",
      "Zoo",
      "Small commercial establishments"
    ],
    "prohibited": [
      "All types of industrial uses",
      "All types of major public facilities",
      "Major infrastructure installations"
    ]
  },
  {
    "group": "Nature and Open Spaces",
    "category": "National Parks Zone (P3-A)",
    "code": "P3-A",
    "description": "National Parks Zone (P3-A) are established to protect the national parks present within the city and its biodiversity towards sustainability, health, and well-being of the community. These parks can bring economic benefits through recreational, educational, and eco-tourism activities.",
    "permitted": [
      "Outdoor recreational facilities, such as sitting areas and",
      "picnic areas.",
      "Hiking trails for environmental education and tourism",
      "Park related public facilities such as public toilet/",
      "changing room."
    ],
    "prohibited": [
      "All types of industrial uses",
      "Major residential uses",
      "Major commercial uses",
      "Major infrastructure installations"
    ]
  },
  {
    "group": "Nature and Open Spaces",
    "category": "Forest Zone (P3-B)",
    "code": "P3-B",
    "description": "Forest Zone (P3-B) are established to ensure sustainable land and resource management for sustainable economic development of the forests within the city towards health and well-being of the community.",
    "permitted": [
      "Existing Forest to be retained",
      "Forestry / Eco-forestry"
    ],
    "prohibited": [
      "All types of industrial uses",
      "All types of residential uses",
      "All types of commercial uses",
      "All types of major public facilities",
      "Major infrastructure installations"
    ]
  },
  {
    "group": "Nature and Open Spaces",
    "category": "Steep Slopes Zone (P3-C)",
    "code": "P3-C",
    "description": "The hillsides and steep slopes are prone to natural hazards and they need to be protected. Unregulated and excessive encroachment on steep slopes can create environmental sensitive areas that are risky and dangerous and can diminish the views and natural features that resident’s value.",
    "permitted": [
      "Forests",
      "Agro-Forestry",
      "Bee Keeping",
      "Silviculture"
    ],
    "prohibited": [
      "All types of developments except those conditionally",
      "allowed by the Slope Overlay between 30-50% slope"
    ]
  },
  {
    "group": "Nature and Open Spaces",
    "category": "Natural Conservation Zone (P3-D)",
    "code": "P3-D",
    "description": "Natural Conservation Zone (P3-D) is established to preserve identified undeveloped land /open spaces in their natural state. It can include protected cultural areas and wildlife habitat or passive recreation like hiking or birdwatching.",
    "permitted": [
      "Conservation Use",
      "Recreational Trail"
    ],
    "prohibited": [
      "All types of industrial uses",
      "All types of residential uses",
      "All types of commercial uses",
      "All types of major public facilities",
      "Major infrastructure installations"
    ]
  },
  {
    "group": "Nature and Open Spaces",
    "category": "Agricultural Zone (A)",
    "code": "A",
    "description": "Agricultural Zone (A) strives to protect the viability of agriculture in the City. The Agricultural zone is meant to prevent farmland from being converted to non-farm uses, to prevent the fragmentation of farms, and to prevent land-use conflicts, as well as to protect agricultural producers from nonfarm intrusion into agricultural areas. Development of Rural Communities is allowed in A Zone only after land pooling processes are actuated to consolidate agricultural land and identify suitable location for rural compact developments",
    "permitted": [
      "Crop farming",
      "Agro-forestry",
      "Livestock farming",
      "Green houses",
      "Bee Keeping",
      "Fish farming"
    ],
    "prohibited": [
      "All types of industrial uses not linked to Agro-Processing uses",
      "All types of residential uses not linked to Farming activities",
      "All types of commercial uses not linked to temporary farm store",
      "All types of public facilities"
    ]
  },
  {
    "group": "Wetland Zone (W)",
    "category": "W1 - Buffer Zone",
    "code": "W1",
    "description": "These regulations shall apply to: • All zoned and re-zoned areas as Wetlands Zone (W)",
    "permitted": [
      "All categories of Wetlands"
    ],
    "prohibited": [
      "All types of industrial uses",
      "All types of residential uses",
      "All types of commercial uses",
      "All types of public facilities"
    ]
  },
  {
    "group": "Wetland Zone (W)",
    "category": "Waterbody Zone (WB)",
    "code": "WB",
    "description": "Waterbody Zone (WB) is established to conserve and protect the waterbodies and sustainably use them for all purposes.",
    "permitted": [
      "Rivers, Lakes, Streams"
    ],
    "prohibited": [
      "All types of industrial wastes",
      "All types of residential wastes",
      "All types of commercial wastes"
    ]
  }
];

export const BASES_OF_VALUE: NamedText[] = [
  {
    "name": "MARKET VALUE",
    "description": "Market value is the estimated amount for which an asset and/or liability should exchange on the valuation date between a willing buyer and a willing seller in an arm’s-length transaction, after proper marketing and where the parties had each acted knowledgeably, prudently and without compulsion."
  },
  {
    "name": "MARKET RENT",
    "description": "Market rent is the estimated amount for which an interest in real property should be leased on the valuation date between a willing lessor and a willing lessee on appropriate lease terms in an arm’s-length transaction, after proper marketing and where the parties had each acted knowledgeably, prudently and without compulsion."
  },
  {
    "name": "EQUITABLE VALUE",
    "description": "Equitable value is the estimated price for the transfer of an asset or liability between identified knowledgeable and willing parties that reflects the respective interests of those parties"
  },
  {
    "name": "INVESTMENT VALUE",
    "description": "Investment value is the value of an asset to a particular owner or prospective owner for individual investment or operational objectives."
  },
  {
    "name": "SYNERGISTIC VALUE",
    "description": "Synergistic value is the result of a combination of two or more assets or interests where the combined value is more than the sum of the separate values"
  },
  {
    "name": "LIQUIDATION VALUE",
    "description": "Liquidation value is the amount that would be realised when an asset or group of assets are sold from a liquidation sale, with the seller being compelled to sell as of a specific date"
  }
];
export const VALUATION_APPROACHES: NamedText[] = [
  {
    "name": "MARKET APPROACH",
    "description": "The market approach provides an indication of value by comparing the asset and/or liability with identical or comparable (that is similar) asset and/ or liability for which price information is available. The market approach should always take into account trading volume, trading frequency, range of observed prices, and proximity to the valuation date. The market approach should be applied and afforded significant weight under the following circumstances: (a) the subject asset has recently been sold in a transaction appropriate for consideration under the basis of value, (b) the subject asset or substantially similar assets are actively publicly traded, and/or (c) there are frequent and/or recent observable transactions in substantially similar assets."
  },
  {
    "name": "INCOME APPROACH",
    "description": "The income approach provides an indication of value by converting projected cash flows to a single current value. Under the income approach, the value of an asset is determined by reference to the value of income, cash flow or cost savings generated by the asset. The income approach should be applied and afforded significant weight under the following circumstances: (a) the income-producing ability of the asset is the critical element affecting value from a participant perspective, and/or (b) reasonable projections of the amount and timing of future income are available for the subject asset, but there are no relevant and reliable market comparables."
  },
  {
    "name": "COST APPROACH",
    "description": "The cost approach provides an indication of value using the economic principle that a buyer will pay no more for an asset than the cost to obtain an asset of equal utility, whether by purchase or by construction, unless undue time, inconvenience, risk or other factors are involved. The approach provides an indication of value by calculating the current replacement or reproduction cost of an asset and making deductions for all relevant forms of obsolescence. The cost approach should be applied and afforded significant weight under the following circumstances: (a) participants would be able to recreate an asset with substantially the same utility as the subject asset, without regulatory or legal restrictions, and the asset could be recreated quickly enough that a participant would not be willing to pay a significant premium for the ability to use the subject asset immediately, (b) the asset is not directly income-generating and the unique nature of the asset makes using an income approach or market approach unfeasible, (c) the basis of value being used is fundamentally based on replacement cost, and/or (d) the asset was recently created or issued and sold to market participants, such that there is a high degree of reliability in the assumptions used in the cost approach."
  }
];
export const VALUATION_ASSUMPTIONS: NamedText[] = [
  {
    "name": "TITLE",
    "description": "The valuation is prepared on the assumption that the property is held under a good and marketable title, free from onerous encumbrances, restrictions, or defects. No investigation of title, legal documentation, or statutory approvals has been undertaken by the valuer. The property is assumed to have all necessary rights of access and services"
  },
  {
    "name": "SERVICES",
    "description": "It is assumed that all mains’ services, including electricity, water, drainage, and telecommunications, are available to the property and are in good working order. No tests or investigations of the services have been undertaken by the valuer. The valuation assumes that the services comply with all statutory requirements and are adequate for the existing use of the property"
  },
  {
    "name": "ENVIRONMENTAL",
    "description": "The valuation is prepared on the assumption that the property is free from contamination, hazardous substances, toxic waste, asbestos, or other environmental hazards that could affect value. No environmental investigations have been carried out by the valuer. Should contamination be present or discovered, it could have a material impact on the value reported"
  },
  {
    "name": "STRUCTURE",
    "description": "The valuation is prepared on the assumption that the building is in reasonable condition, structurally sound, and free from major or latent defects. No structural survey, opening-up works, or tests have been undertaken by the valuer. The valuation assumes that no material expenditure is required for repair or replacement beyond normal maintenance"
  }
];
