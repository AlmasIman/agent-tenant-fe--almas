export interface TenantArticleData {
  id: number;
  article: number; // article id
  article_name: string;
  article_parent: number;
  space: number; // space id
  space_name: string;
  space_description: string;
}

export interface ArticleData {
  id: number;
  name: string;
  description: string;
  content: string;
  parent: number; // parent article id
  publisher: string;
  tags: string;
}
