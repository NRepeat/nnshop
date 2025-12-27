import { getCollection } from '@entities/collection/api/getCollection';
import { notFound } from 'next/navigation';
import { ClientGridWrapper } from './ClientGridWrapper';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@shared/ui/breadcrumb';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Button } from '@shared/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@shared/ui/carousel';
import { cacheTag } from 'next/cache';
import { FilterSheet } from './FilterSheet';
export const CollectionGrid = async ({
  slug,
  locale,
  gender,
  searchParams,
}: {
  slug: string;
  locale: string;
  gender?: string;
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const collectionData = await getCollection({
    handle: slug,
    first: 20,
    locale: locale,
    searchParams: searchParams,
  });
  if (!collectionData) {
    return notFound();
  }
  const collection = collectionData.collection;

  if (!collection) {
    return notFound();
  }
  const pageInfo = collectionData.collection?.products.pageInfo;
  const products = collection.products.edges.map((edge) => edge.node);
  const filters = [
    { label: 'Ціна', value: 'price' },
    { label: 'Колір', value: 'color' },
    { label: 'Розмір', value: 'size' },
    { label: 'Розмір', value: 'size' },
    { label: 'Розмір', value: 'size' },
    { label: 'Розмір', value: 'size' },
    { label: 'Розмір', value: 'size' },
  ];
  return (
    <div className="flex flex-col gap-8 mt-8">
      <Breadcrumb className="">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}`}>Головна</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              {gender === 'man' ? 'Мужчини' : 'Жінки'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{collection?.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full border-b border-muted pb-4 flex flex-col lg:flex-row   justify-between lg:items-end gap-6">
        <div className="flex flex-col gap-3.5 w-full">
          <h2 className="text-2xl font-bold">{collection?.title}</h2>
          <Carousel>
            <CarouselContent className="pl-2 md:max-w-full lg:max-w-full">
              {filters.map((filter) => (
                <CarouselItem
                  key={filter.value}
                  className="flex flex-col items-center justify-center gap-1 rounded-full border border-muted-foreground px-4 py-1 basis-1/4 md:basis-1/6 ml-2"
                >
                  <label className="text-sm font-medium">{filter.label}</label>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        <div className="flex h-full items-end flex-row gap-2 justify-end ">
          <Select>
            <SelectTrigger className="w-[160px]  md:w-[210px] rounded-none">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectGroup>
                <SelectLabel>Sort by</SelectLabel>
                <SelectItem className="rounded-none" value="trending">
                  Trending
                </SelectItem>
                <SelectItem className="rounded-none" value="price-asc">
                  Price: Low to High
                </SelectItem>
                <SelectItem className="rounded-none" value="price-desc">
                  Price: High to Low
                </SelectItem>
                <SelectItem className="rounded-none" value="created-desc">
                  Newest
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex w-full justify-between md:justify-end">
            <FilterSheet filters={collection.products.filters} />
          </div>
        </div>
      </div>
      <div className="flex justify-center  gap-8   h-full">
        <ClientGridWrapper
          initialPageInfo={pageInfo as PageInfo}
          initialProducts={products as Product[]}
        />
      </div>
    </div>
  );
};
