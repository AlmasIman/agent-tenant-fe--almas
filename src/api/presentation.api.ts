import { httpApi } from './http.api';

export interface PresentationSlide {
  id: number;
  name: string;
  type: string;
  data: any;
  order: number;
  presentation: number;
}

export interface Presentation {
  id: number;
  name: string;
  created_date: string;
  modified_date: string;
  slides: PresentationSlide[];
}

export class PresentationApi {
  static async getPresentation(id: number): Promise<Presentation> {
    try {
      const response = await httpApi.get(`/presentations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching presentation:', error);
      throw error;
    }
  }

  static async getPresentations(): Promise<Presentation[]> {
    try {
      const response = await httpApi.get('/presentations/');
      return response.data;
    } catch (error) {
      console.error('Error fetching presentations:', error);
      throw error;
    }
  }
}
