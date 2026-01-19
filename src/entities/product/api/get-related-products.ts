import { getProductsByIds } from './getProductsByIds';

export const getReletedProducts = async (ids: string[], locale: string) => {
  try {
    const res = await getProductsByIds(ids, locale);
    return res;
  } catch (err) {
    console.log(err);
    throw new Error('Error get metaobjects');
  }
};
