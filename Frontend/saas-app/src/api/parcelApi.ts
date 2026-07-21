import api from './axiosConfig';

export const confirmShipment = async (parcelId: string) => {
  const response = await api.patch(`/parcels/${parcelId}/status`, {
    status: 'CONFIRMED_BY_CUSTOMER',
  });
  return response.data;
};