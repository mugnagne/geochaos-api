import { Bonus } from '../types';

export const BONUSES: Bonus[] = [
  {
    id: 'RELOCATION',
    name: 'Déménagement',
    description: 'Relance aléatoirement la roue des pays une seule fois.',
    icon: 'Globe'
  },
  {
    id: 'REROLL',
    name: 'Reroll',
    description: 'Change une des catégories non jouées pour une autre aléatoirement.',
    icon: 'BarChart'
  },
  {
    id: 'ZOMBIE',
    name: 'Zombie',
    description: 'Permet de resélectionner une catégorie déjà utilisée auparavant.',
    icon: 'Skull' // or Ghost if lucide doesn't have skull
  },
  {
    id: 'CLAIRVOYANT',
    name: 'Voyante',
    description: 'Affiche les stats du pays actuel dans toutes les catégories.',
    icon: 'Eye'
  },
  {
    id: 'DOUBLE_OR_NOTHING',
    name: 'Quitte ou Double',
    description: 'Passe la manche actuelle, mais la prochaine compte double.',
    icon: 'Spade' // Lucide-react doesn't have spade, maybe Dices or Club or PlayingCards? We will use Dices or similar if needed. Let's use 'Club' or 'Diamond' or 'Gamepad2'
  },
  {
    id: 'FORESHADOWING',
    name: 'Foreshadowing',
    description: 'Permet de connaître le prochain pays sélectionné à l\'avance.',
    icon: 'Search' // or Lens
  }
];
