import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@shared/ui/card';
import { Separator } from '@shared/ui/separator';
import { Order } from '@entities/order/model/types';
import { getTranslations } from 'next-intl/server';

type OrderDetailsProps = {
  order: Order;
};

export const OrderDetails = async ({ order }: OrderDetailsProps) => {
  const t = await getTranslations('OrderPage.details');

  return (
    <Card className="shadow-sm rounded-none mt-4">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {order.name} - {order.displayFulfillmentStatus}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-4">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>{t('contactInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {order.shippingAddress.firstName}{' '}
                {order.shippingAddress.lastName}
              </p>
              <p>{order.email}</p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>{t('shippingAddress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {order.shippingAddress.firstName}{' '}
                {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.address1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.zip}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p>{order.shippingAddress.phone}</p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>{t('payment')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {order.totalPriceSet.presentmentMoney.amount}{' '}
                {order.totalPriceSet.presentmentMoney.currencyCode}
              </p>
              <p>{new Date(order.processedAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>{t('billingAddress')}</CardTitle>
            </CardHeader>
            <CardContent>
              {order.billingAddress ? (
                <>
                  <p>
                    {order.billingAddress.firstName}{' '}
                    {order.billingAddress.lastName}
                  </p>
                  <p>{order.billingAddress.address1}</p>
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.zip}
                  </p>
                  <p>{order.billingAddress.country}</p>
                  <p>{order.billingAddress.phone}</p>
                </>
              ) : (
                <p>{t('sameAsShipping')}</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>{t('summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {order.lineItems.edges.map(({ node: item }) => (
                  <div
                    key={item.title}
                    className="grid grid-cols-[80px_1fr_auto] items-center gap-4"
                  >
                    <Image
                      src={item.image.url}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.variant.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('quantity')}: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {item.variant.price.amount}{' '}
                      {item.variant.price.currencyCode}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="flex justify-between w-full">
                <span>{t('subtotal')}</span>
                <span>
                  {order.subtotalPriceSet.presentmentMoney.amount}{' '}
                  {order.subtotalPriceSet.presentmentMoney.currencyCode}
                </span>
              </div>
              <div className="flex justify-between w-full">
                <span>{t('shipping')}</span>
                <span>
                  {order.totalShippingPriceSet.presentmentMoney.amount}{' '}
                  {order.totalShippingPriceSet.presentmentMoney.currencyCode}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between w-full font-medium">
                <span>{t('total')}</span>
                <span>
                  {order.totalPriceSet.presentmentMoney.amount}{' '}
                  {order.totalPriceSet.presentmentMoney.currencyCode}
                </span>
              </div>
              <div className="flex justify-between w-full text-sm text-muted-foreground">
                <span>
                  {t('including')} {order.totalTaxSet.presentmentMoney.amount}{' '}
                  {order.totalTaxSet.presentmentMoney.currencyCode} {t('taxes')}
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
