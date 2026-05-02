
export type Language = 'fr' | 'en';

export const TRANSLATIONS = {
  fr: {
    title_geo: "GEO",
    title_chaos: "CHAOS",
    pieces: "PIÈCES",
    record: "RECORD",
    subtitle: "Un pays aléatoire, 6 catégories secrètes. Fais les bons choix pour le meilleur classement.",
    btn_infinite: "RANDOM",
    btn_daily: "DÉFI",
    btn_shop: "SHOP",
    btn_collection: "COLLECTION",
    btn_tutorial: "Comment jouer ?",
    daily_mode_desc: "MODE DÉFI : UNE SÉLECTION DE CATÉGORIES QUI CHANGENT CHAQUE JOUR !",
    how_to_play: "Comment Jouer ?",
    step1_title: "À chaque manche, un pays aléatoire t'est attribué.",
    step2_title: "Choisis une catégorie pour ce pays. Ton but : trouver là où il est le mieux classé au monde.",
    step3_title: "Tu commences avec 200 points. Son classement mondial te fait perdre des points.",
    step4_title: "Survis aux 6 manches sans tomber en dessous de 0 pour gagner la partie !",
    btn_lets_go: "C'EST PARTI !",
    round: "Manche",
    score: "Score",
    more_info: "PLUS D'INFORMATIONS",
    hide_info: "CACHER",
    capital: "Capitale",
    language_label: "Langue",
    currency: "Monnaie",
    largest_city: "Grande Ville",
    understand: "COMPRIS !",
    rank_of_countries: "PAYS",
    no_stats: "Pas de stat",
    victory: "VICTOIRE !",
    game_over: "PERDU...",
    final_score: "Score Final",
    rank_summary: "RÉSUMÉ DES RANGS",
    play_again: "REJOUER",
    main_menu: "MENU PRINCIPAL",
    logout: "Déconnexion",
    login: "Connexion",
    alpha: "ALPHA",
    quit_game: "Quitter la partie",
    sync_online: "Synchronisé",
    sync_offline: "Mode Hors-ligne (Cloud déconnecté)",
    sync_checking: "Vérification sync...",
    best_rank: "meilleur classement",
    ranking_this_country: "Classer ce pays",
    used: "UTILISÉ",
    total_ranks: "TOTAL DES RANGS",
    btn_back: "Retour",
    btn_inspect: "Inspecter",
    shop_title: "CAPSULE COLLECTOR",
    shop_subtitle: "Tire une carte de pays aléatoire !",
    shop_price: "Prix : 10 pièces",
    shop_cheat_mode: "CHEAT MODE ACTIF : Tirages gratuits",
    shop_pulling: "VROUM VROUM...",
    shop_pull_again: "TIRER ENCORE (10P)",
    shop_pull_btn: "TIRER POUR 10 PIÈCES",
    promo_placeholder: "PROMO CODE",
    promo_btn: "OK",
    promo_success: "+10 Pièces !",
    promo_invalid: "Code invalide",
    promo_already_used: "Code déjà utilisé",
    collection_title: "MA COLLECTION",
    collection_empty: "Tu n'as pas encore de cartes !",
    collection_btn_shop: "Aller au shop",
    rarity_all: "TOUS",
    rarity_commun: "COMMUN",
    rarity_rare: "RARE",
    rarity_epique: "ÉPIQUE",
    rarity_legendaire: "LÉGENDAIRE",
    rarity_geochaos: "GEOCHAOS",
    new_card: "NOUVEAU",
    foreshadowing_label: "Foreshadowing",
    foreshadowing_next: "Prochain pays",
  },
  en: {
    title_geo: "GEO",
    title_chaos: "CHAOS",
    pieces: "COINS",
    record: "RECORD",
    subtitle: "A random country, 6 secret categories. Make the right choices for the best ranking.",
    btn_infinite: "RANDOM",
    btn_daily: "CHALLENGE",
    btn_shop: "SHOP",
    btn_collection: "COLLECTION",
    btn_tutorial: "How to play?",
    daily_mode_desc: "CHALLENGE MODE: A SELECTION OF CATEGORIES THAT CHANGE EVERY DAY!",
    how_to_play: "How to Play?",
    step1_title: "Each round, a random country is assigned to you.",
    step2_title: "Choose a category for this country. Your goal: find where it ranks best in the world.",
    step3_title: "You start with 200 points. Its world ranking makes you lose points.",
    step4_title: "Survive 6 rounds without falling below 0 to win the game!",
    btn_lets_go: "LET'S GO!",
    round: "Round",
    score: "Score",
    more_info: "MORE INFO",
    hide_info: "HIDE",
    capital: "Capital",
    language_label: "Language",
    currency: "Currency",
    largest_city: "Largest City",
    understand: "UNDERSTOOD!",
    rank_of_countries: "COUNTRIES",
    no_stats: "No statistics",
    victory: "VICTORY!",
    game_over: "GAME OVER...",
    final_score: "Final Score",
    rank_summary: "RANK SUMMARY",
    play_again: "PLAY AGAIN",
    main_menu: "MAIN MENU",
    logout: "Logout",
    login: "Login",
    alpha: "ALPHA",
    quit_game: "Quit game",
    sync_online: "Synced",
    sync_offline: "Offline Mode (Cloud disconnected)",
    sync_checking: "Checking sync...",
    best_rank: "best ranking",
    ranking_this_country: "Rank this country",
    used: "USED",
    total_ranks: "TOTAL RANKS",
    btn_back: "Back",
    btn_inspect: "Inspect",
    shop_title: "CAPSULE COLLECTOR",
    shop_subtitle: "Pull a random country card!",
    shop_price: "Price: 10 coins",
    shop_cheat_mode: "CHEAT MODE ACTIVE: Free pulls",
    shop_pulling: "VROOM VROOM...",
    shop_pull_again: "PULL AGAIN (10C)",
    shop_pull_btn: "PULL FOR 10 COINS",
    promo_placeholder: "PROMO CODE",
    promo_btn: "OK",
    promo_success: "+10 Coins!",
    promo_invalid: "Invalid code",
    promo_already_used: "Code already used",
    collection_title: "MY COLLECTION",
    collection_empty: "You don't have any cards yet!",
    collection_btn_shop: "Go to the shop",
    rarity_all: "ALL",
    rarity_commun: "COMMON",
    rarity_rare: "RARE",
    rarity_epique: "EPIC",
    rarity_legendaire: "LEGENDARY",
    rarity_geochaos: "GEOCHAOS",
    new_card: "NEW",
    foreshadowing_label: "Foreshadowing",
    foreshadowing_next: "Next country",
  }
};

export const CATEGORY_TRANSLATIONS = {
  alcoholConsumption: {
    fr: { label: "Conso. Alcool", labelHigher: "Plus forte conso. d'alcool", labelLower: "Plus faible conso. d'alcool", unit: 'L/hab', description: "Consommation annuelle d'alcool pur par personne." },
    en: { label: "Alcohol Cons.", labelHigher: "Highest alcohol cons.", labelLower: "Lowest alcohol cons.", unit: 'L/capita', description: "Annual pure alcohol consumption per person." }
  },
  averageTemp: {
    fr: { label: "Température", labelHigher: "Température la plus élevée", labelLower: "Température la plus basse", unit: '°C', description: "Température moyenne annuelle." },
    en: { label: "Temperature", labelHigher: "Highest temperature", labelLower: "Lowest temperature", unit: '°C', description: "Average annual temperature." }
  },
  coffeeProduction: {
    fr: { label: "Prod. Café", labelHigher: "Plus grande prod. de café", labelLower: "Plus petite prod. de café", unit: 'tonnes', description: "Production annuelle de café." },
    en: { label: "Coffee Prod.", labelHigher: "Highest coffee prod.", labelLower: "Lowest coffee prod.", unit: 'tons', description: "Annual coffee production." }
  },
  corruptionIndex: {
    fr: { label: "Transparence", labelHigher: "Plus haut indice de transparence", labelLower: "Plus bas indice de transparence", unit: '/100', description: "Indice de perception de la corruption (CPI) (plus il est haut, moins il y a de corruption)." },
    en: { label: "Transparency", labelHigher: "Highest transparency index", labelLower: "Lowest transparency index", unit: '/100', description: "Corruption Perceptions Index (CPI) (higher means less corruption)." }
  },
  democracyScore: {
    fr: { label: "Démocratie", labelHigher: "Meilleur score de démocratie", labelLower: "Pire score de démocratie", unit: '/10', description: "Indice de démocratie (EIU)." },
    en: { label: "Democracy", labelHigher: "Best democracy score", labelLower: "Worst democracy score", unit: '/10', description: "Democracy Index (EIU)." }
  },
  riceProduction: {
    fr: { label: "Prod. Riz", labelHigher: "Plus grande prod. de riz", labelLower: "Plus petite prod. de riz", unit: 'tonnes', description: "Production annuelle de riz." },
    en: { label: "Rice Prod.", labelHigher: "Highest rice prod.", labelLower: "Lowest rice prod.", unit: 'tons', description: "Annual rice production." }
  },
  highestPoint: {
    fr: { label: "Altitude Max", labelHigher: "Point culminant le plus haut", labelLower: "Point culminant le plus bas", unit: 'm', description: "Point le plus élevé du territoire." },
    en: { label: "Max Altitude", labelHigher: "Highest point", labelLower: "Lowest point", unit: 'm', description: "Highest elevated point in the territory." }
  },
  homicideRate: {
    fr: { label: "Homicides", labelHigher: "Plus fort taux d'homicides", labelLower: "Plus faible taux d'homicides", unit: '/100k', description: "Taux d'homicides volontaires pour 100 000 habitants." },
    en: { label: "Homicides", labelHigher: "Highest homicide rate", labelLower: "Lowest homicide rate", unit: '/100k', description: "Intentional homicide rate per 100,000 inhabitants." }
  },
  obesityRate: {
    fr: { label: "Obésité", labelHigher: "Plus fort taux d'obésité", labelLower: "Plus faible taux d'obésité", unit: '%', description: "Pourcentage de la population adulte obèse." },
    en: { label: "Obesity", labelHigher: "Highest obesity rate", labelLower: "Lowest obesity rate", unit: '%', description: "Percentage of the adult population that is obese." }
  },
  over65Rate: {
    fr: { label: "Séniors (65+)", labelHigher: "Plus forte part de séniors", labelLower: "Plus faible part de séniors", unit: '%', description: "Part de la population de 65 ans et plus." },
    en: { label: "Seniors (65+)", labelHigher: "Highest share of seniors", labelLower: "Lowest share of seniors", unit: '%', description: "Share of the population aged 65 and over." }
  },
  under15Rate: {
    fr: { label: "Jeunes (<15 ans)", labelHigher: "Plus forte part de jeunes", labelLower: "Plus faible part de jeunes", unit: '%', description: "Part de la population de moins de 15 ans." },
    en: { label: "Youth (<15 yrs)", labelHigher: "Highest share of youth", labelLower: "Lowest share of youth", unit: '%', description: "Share of the population under 15 years old." }
  },
  annualPrecipitation: {
    fr: { label: "Précipitations", labelHigher: "Précipitations les plus fortes", labelLower: "Précipitations les plus faibles", unit: 'mm/an', description: "Cumul annuel moyen de précipitations." },
    en: { label: "Precipitation", labelHigher: "Highest precipitation", labelLower: "Lowest precipitation", unit: 'mm/year', description: "Average annual cumulated precipitation." }
  },
  populationGrowthRate: {
    fr: { label: "Croissance Pop.", labelHigher: "Plus forte croissance pop.", labelLower: "Plus faible croissance pop.", unit: '%', description: "Taux de croissance annuel de la population." },
    en: { label: "Pop. Growth", labelHigher: "Highest pop. growth", labelLower: "Lowest pop. growth", unit: '%', description: "Annual population growth rate." }
  },
  fruitProduction: {
    fr: { label: "Prod. Fruits", labelHigher: "Plus grande prod. de fruits", labelLower: "Plus petite prod. de fruits", unit: 'tonnes', description: "Production annuelle totale de fruits." },
    en: { label: "Fruit Prod.", labelHigher: "Highest fruit prod.", labelLower: "Lowest fruit prod.", unit: 'tons', description: "Total annual fruit production." }
  },
  childLabour: {
    fr: { label: "Travail des enfants", labelHigher: "Plus fort taux de travail infantile", labelLower: "Plus faible taux de travail infantile", unit: '%', description: "Pourcentage d'enfants (5-17 ans) engagés dans le travail des enfants." },
    en: { label: "Child Labour", labelHigher: "Highest child labour rate", labelLower: "Lowest child labour rate", unit: '%', description: "Percentage of children (5-17 years old) engaged in child labour." }
  },
  roadTrafficDeaths: {
    fr: { label: "Morts sur la route", labelHigher: "Plus grand nombre de tués sur la route", labelLower: "Plus petit nombre de tués sur la route", unit: 'morts', description: "Nombre annuel de décès liés aux accidents de la circulation." },
    en: { label: "Road Deaths", labelHigher: "Highest road traffic deaths", labelLower: "Lowest road traffic deaths", unit: 'deaths', description: "Annual number of deaths related to traffic accidents." }
  },
  density: {
    fr: { label: "Densité", labelHigher: "Plus forte densité", labelLower: "Plus faible densité", unit: 'hab/km²', description: "Densité de population (habitants par km²)." },
    en: { label: "Density", labelHigher: "Highest density", labelLower: "Lowest density", unit: 'inh/km²', description: "Population density (inhabitants per km²)." }
  },
  agriculturalLand: {
    fr: { label: "Terres Agricoles", labelHigher: "Plus fort % de terres agricoles", labelLower: "Plus faible % de terres agricoles", unit: '%', description: "Pourcentage du territoire utilisé pour l'agriculture." },
    en: { label: "Agri. Land", labelHigher: "Highest % agri. land", labelLower: "Lowest % agri. land", unit: '%', description: "Percentage of the territory used for agriculture." }
  },
  landArea: {
    fr: { label: "Superficie", labelHigher: "Plus grande superficie", labelLower: "Plus petite superficie", unit: 'km²', description: "Superficie totale des terres." },
    en: { label: "Land Area", labelHigher: "Largest land area", labelLower: "Smallest land area", unit: 'km²', description: "Total land area." }
  },
  armedForcesSize: {
    fr: { label: "Forces Armées", labelHigher: "Plus grandes forces armées", labelLower: "Plus petites forces armées", unit: 'k pers.', description: "Taille des forces armées du pays (en milliers)." },
    en: { label: "Armed Forces", labelHigher: "Largest armed forces", labelLower: "Smallest armed forces", unit: 'k pers.', description: "Size of the country's armed forces (in thousands)." }
  },
  birthRate: {
    fr: { label: "Taux de Natalité", labelHigher: "Plus fort taux de natalité", labelLower: "Plus faible taux de natalité", unit: '‰', description: "Nombre moyen de naissances pour 1000 habitants." },
    en: { label: "Birth Rate", labelHigher: "Highest birth rate", labelLower: "Lowest birth rate", unit: '‰', description: "Average number of births per 1000 inhabitants." }
  },
  co2Emissions: {
    fr: { label: "Émissions CO2", labelHigher: "Plus fortes émissions CO2", labelLower: "Plus faibles émissions CO2", unit: 'kt', description: "Émissions totales de dioxyde de carbone." },
    en: { label: "CO2 Emissions", labelHigher: "Highest CO2 emissions", labelLower: "Lowest CO2 emissions", unit: 'kt', description: "Total carbon dioxide emissions." }
  },
  fertilityRate: {
    fr: { label: "Taux de Fécondité", labelHigher: "Plus fort taux de fécondité", labelLower: "Plus faible taux de fécondité", unit: 'enf/femme', description: "Nombre moyen d'enfants par femme." },
    en: { label: "Fertility Rate", labelHigher: "Highest fertility rate", labelLower: "Lowest fertility rate", unit: 'children/woman', description: "Average number of children per woman." }
  },
  forestedArea: {
    fr: { label: "Superficie Forestière", labelHigher: "Plus fort % de forêt", labelLower: "Plus faible % de forêt", unit: '%', description: "Pourcentage du territoire recouvert de forêts." },
    en: { label: "Forested Area", labelHigher: "Highest % forest", labelLower: "Lowest % forest", unit: '%', description: "Percentage of the territory covered by forests." }
  },
  gasolinePrice: {
    fr: { label: "Prix de l'Essence", labelHigher: "Essence la plus chère", labelLower: "Essence la moins chère", unit: '$', description: "Prix moyen du litre d'essence." },
    en: { label: "Gasoline Price", labelHigher: "Highest gasoline price", labelLower: "Lowest gasoline price", unit: '$', description: "Average price for a litre of gasoline." }
  },
  gdp: {
    fr: { label: "PIB", labelHigher: "Plus fort PIB", labelLower: "Plus faible PIB", unit: '$', description: "Produit Intérieur Brut du pays." },
    en: { label: "GDP", labelHigher: "Highest GDP", labelLower: "Lowest GDP", unit: '$', description: "Gross Domestic Product of the country." }
  },
  infantMortality: {
    fr: { label: "Mortalité Infantile", labelHigher: "Plus forte mortalité infantile", labelLower: "Plus faible mortalité infantile", unit: '‰', description: "Décès d'enfants de moins d'un an pour 1000 naissances." },
    en: { label: "Infant Mortality", labelHigher: "Highest infant mortality", labelLower: "Lowest infant mortality", unit: '‰', description: "Deaths of children under one year old per 1000 births." }
  },
  lifeExpectancy: {
    fr: { label: "Espérance de vie", labelHigher: "Plus longue espérance de vie", labelLower: "Plus courte espérance de vie", unit: 'ans', description: "Espérance de vie moyenne à la naissance." },
    en: { label: "Life Expectancy", labelHigher: "Longest life expectancy", labelLower: "Shortest life expectancy", unit: 'years', description: "Average life expectancy at birth." }
  },
  minimumWage: {
    fr: { label: "Salaire Minimum", labelHigher: "Salaire minimum le plus haut", labelLower: "Salaire minimum le plus bas", unit: '$', description: "Salaire minimum mensuel." },
    en: { label: "Minimum Wage", labelHigher: "Highest minimum wage", labelLower: "Lowest minimum wage", unit: '$', description: "Monthly minimum wage." }
  },
  outOfPocketHealthExpenditure: {
    fr: { label: "Dépenses de Santé (Hors Assurance)", labelHigher: "Plus fort reste-à-charge", labelLower: "Plus faible reste-à-charge", unit: '%', description: "Part des dépenses de santé payées directement par les patients." },
    en: { label: "Out-of-Pocket Health Exp.", labelHigher: "Highest out-of-pocket exp.", labelLower: "Lowest out-of-pocket exp.", unit: '%', description: "Share of health expenditure paid directly by patients." }
  },
  physiciansPerThousand: {
    fr: { label: "Médecins", labelHigher: "Plus de médecins par hab", labelLower: "Moins de médecins par hab", unit: '/1000', description: "Nombre de médecins pour 1000 habitants." },
    en: { label: "Physicians", labelHigher: "Most physicians per capita", labelLower: "Fewest physicians per capita", unit: '/1000', description: "Number of physicians per 1000 inhabitants." }
  },
  laborForceParticipation: {
    fr: { label: "Population Active", labelHigher: "Plus fort taux d'actifs", labelLower: "Plus faible taux d'actifs", unit: '%', description: "Part de la population participant à la force de travail." },
    en: { label: "Labor Force Participation", labelHigher: "Highest participation rate", labelLower: "Lowest participation rate", unit: '%', description: "Share of the population participating in the labor force." }
  },
  taxRevenue: {
    fr: { label: "Recettes Fiscales", labelHigher: "Plus fortes recettes fiscales", labelLower: "Plus faibles recettes fiscales", unit: '%', description: "Recettes fiscales en pourcentage du PIB." },
    en: { label: "Tax Revenue", labelHigher: "Highest tax revenue", labelLower: "Lowest tax revenue", unit: '%', description: "Tax revenue as a percentage of GDP." }
  },
  totalTaxRate: {
    fr: { label: "Taux d'Imposition", labelHigher: "Plus fort taux d'imposition", labelLower: "Plus faible taux d'imposition", unit: '%', description: "Taux global d'imposition sur les entreprises." },
    en: { label: "Total Tax Rate", labelHigher: "Highest tax rate", labelLower: "Lowest tax rate", unit: '%', description: "Total tax rate on businesses." }
  },
  unemploymentRate: {
    fr: { label: "Chômage", labelHigher: "Plus fort taux de chômage", labelLower: "Plus faible taux de chômage", unit: '%', description: "Taux de chômage." },
    en: { label: "Unemployment Rate", labelHigher: "Highest unemployment rate", labelLower: "Lowest unemployment rate", unit: '%', description: "Unemployment rate." }
  },
  urbanPopulation: {
    fr: { label: "Pop. Urbaine", labelHigher: "Plus grande pop. urbaine", labelLower: "Plus petite pop. urbaine", unit: 'hab', description: "Nombre d'habitants vivant en zone urbaine." },
    en: { label: "Urban Pop.", labelHigher: "Highest urban population", labelLower: "Lowest urban population", unit: 'inh', description: "Number of inhabitants living in urban areas." }
  }
};
