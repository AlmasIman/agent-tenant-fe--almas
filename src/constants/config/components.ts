import { CategoryType } from '../categoriesList';

export interface Component {
  name: string;
  title: string;
  url: string;
  categories: CategoryType[];
  keywords: string[];
}

// TODO review and come up with a better approach for urls
// maybe we need to have enum with all routes like we had before?

// TODO change urls according to new dashboard routes and add new NFT components
export const components: Component[] = [
  
];
