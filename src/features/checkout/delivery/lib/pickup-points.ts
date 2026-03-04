export const SELF_PICKUP_POINTS = [
  {
    id: 'mio-mio',
    name: 'Mio Mio',
    address: 'пр. Соборний 186',
    city: 'Запоріжжя',
    fullAddress: 'пр. Соборний 186, м. Запоріжжя',
  },
  {
    id: 'mio-mio-best',
    name: 'Mio Mio Best',
    address: 'пр. Соборний 189',
    city: 'Запоріжжя',
    fullAddress: 'пр. Соборний 189, м. Запоріжжя',
  },
  {
    id: 'svitlana-92',
    name: '«Світлана»',
    address: 'пр. Соборний 92 (ТЦ Верже)',
    city: 'Запоріжжя',
    fullAddress: 'пр. Соборний 92 (ТЦ Верже), м. Запоріжжя',
  },
  {
    id: 'svitlana-189',
    name: '«Світлана»',
    address: 'пр. Соборний 189',
    city: 'Запоріжжя',
    fullAddress: 'пр. Соборний 189, м. Запоріжжя',
  },
] as const;

export type PickupPointId = (typeof SELF_PICKUP_POINTS)[number]['id'];

export function getPickupPoint(id: string) {
  return SELF_PICKUP_POINTS.find((p) => p.id === id);
}
