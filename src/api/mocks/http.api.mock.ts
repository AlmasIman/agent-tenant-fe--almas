import AxiosMockAdapter from 'axios-mock-adapter';
import { httpApi2 } from '@app/api/http.api';

export const httpApiMock = new AxiosMockAdapter(httpApi2, { delayResponse: 1000 });
