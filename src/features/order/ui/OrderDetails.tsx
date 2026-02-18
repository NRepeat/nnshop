import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@shared/ui/card';
import { Separator } from '@shared/ui/separator';
import { Order } from '@entities/order/model/types';
import { getTranslations } from 'next-intl/server';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderTimeline } from './OrderTimeline';
import { User, MapPin, CreditCard, Package } from 'lucide-react';

const getDeliveryMethodKey = (method: string): string => {
  switch (method) {
    case 'novaPoshta':
      return 'novaPoshta';
    case 'ukrPoshta':
      return 'ukrPoshta';
    default:
      return method;
  }
};

const getPaymentMethodKey = (method: string): string => {
  switch (method) {
    case 'pay-now':
      return 'payNow';
    case 'after-delivered':
      return 'afterDelivered';
    case 'pay-later':
      return 'payLater';
    default:
      return method;
  }
};

type LocalOrderUser = {
  contactInformation: {
    name: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
  deliveryInformation: {
    deliveryMethod: string;
    country: string | null;
    address: string | null;
    apartment: string | null;
    city: string | null;
    postalCode: string | null;
    novaPoshtaDepartment: {
      shortName: string;
      city: string | null;
      street: string | null;
    } | null;
  } | null;
  paymentInformation: {
    paymentMethod: string;
    paymentProvider: string;
    amount: number;
    currency: string;
  } | null;
} | null;

type LocalOrder = {
  user: LocalOrderUser;
} | null;

type OrderDetailsProps = {
  order: Order;
  locale: string;
  localOrder?: LocalOrder;
};

export const OrderDetails = async ({
  order,
  locale,
  localOrder,
}: OrderDetailsProps) => {
  const t = await getTranslations({ locale, namespace: 'OrderPage.details' });
  const tOrder = await getTranslations({ locale, namespace: 'OrderPage' });
  const tDelivery = await getTranslations({ locale, namespace: 'DeliveryForm' });
  const tPayment = await getTranslations({ locale, namespace: 'PaymentForm' });

  const user = localOrder?.user;
  const contact = user?.contactInformation ?? (
    (order.shippingAddress?.firstName || order.email)
      ? {
          name: order.shippingAddress?.firstName ?? '',
          lastName: order.shippingAddress?.lastName ?? '',
          email: order.email ?? '',
          phone: order.shippingAddress?.phone ?? '',
        }
      : null
  );
  const delivery = user?.deliveryInformation ?? (
    order.shippingAddress?.address1
      ? {
          deliveryMethod: 'address',
          country: order.shippingAddress.country ?? null,
          address: order.shippingAddress.address1 ?? null,
          apartment: order.shippingAddress.address2 ?? null,
          city: order.shippingAddress.city ?? null,
          postalCode: order.shippingAddress.zip ?? null,
          novaPoshtaDepartment: null,
        }
      : null
  );
  const payment = user?.paymentInformation ?? null;

  return (
    <div className="mt-4 space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{order.name}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(order.processedAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <OrderStatusBadge status={order.displayFulfillmentStatus} />
          </div>
        </CardHeader>
        <CardContent>
          <OrderTimeline status={order.displayFulfillmentStatus} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4" />
                {t('contactInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contact ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {contact.name} {contact.lastName}
                  </p>
                  <p className="text-muted-foreground">{contact.email}</p>
                  <p className="text-muted-foreground">{contact.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4" />
                {t('shippingAddress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {delivery ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {tDelivery(getDeliveryMethodKey(delivery.deliveryMethod))}
                  </p>
                  {delivery.novaPoshtaDepartment ? (
                    <>
                      <p className="text-muted-foreground">
                        {delivery.novaPoshtaDepartment.shortName}
                      </p>
                      {delivery.novaPoshtaDepartment.city && (
                        <p className="text-muted-foreground">
                          {delivery.novaPoshtaDepartment.city}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      {delivery.address && (
                        <p className="text-muted-foreground">
                          {delivery.address}
                          {delivery.apartment && `, ${delivery.apartment}`}
                        </p>
                      )}
                      {delivery.city && (
                        <p className="text-muted-foreground">
                          {delivery.city}
                          {delivery.postalCode && `, ${delivery.postalCode}`}
                        </p>
                      )}
                      {delivery.country && (
                        <p className="text-muted-foreground">{delivery.country}</p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4" />
                {t('payment')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payment ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {tPayment(getPaymentMethodKey(payment.paymentMethod))}
                  </p>
                  {payment.paymentMethod !== 'after-delivered' && (
                    <p className="text-muted-foreground">
                      {tPayment(payment.paymentProvider)}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    {payment.amount} {payment.currency}
                  </p>
                </div>
              ) : order.financialStatus ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {tOrder(`financialStatus.${order.financialStatus}` as any) || order.financialStatus}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="w-4 h-4" />
                {t('summary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.lineItems.edges.map(({ node: item }, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4"
                  >
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                      {item.image?.url ? (
                        <Image
                          src={item.image.url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          ?
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.variant.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('quantity')}: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-sm shrink-0">
                      {item.variant.price.amount} {item.variant.price.currencyCode}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  {/* <span className="text-muted-foreground">{t('subtotal')}</span> */}
                  <span>
                    {order.subtotalPriceSet.presentmentMoney.amount}{' '}
                    {order.subtotalPriceSet.presentmentMoney.currencyCode}
                  </span>
                </div>

                {/* Show discount applications if any */}
                {order.discountApplications?.edges &&
                  order.discountApplications.edges.length > 0 && (
                    <div className="flex justify-between text-green-600">
                      <div className="flex flex-col gap-1">
                        <span>{t('discount')}</span>
                        {order.discountApplications.edges.map(({ node }, idx) => {
                          const code = 'code' in node ? node.code : node.title;
                          return code ? (
                            <span key={idx} className="text-xs font-medium">
                              {code}
                            </span>
                          ) : null;
                        })}
                      </div>
                      <span>
                        {order.discountApplications.edges.map(({ node }) => {
                          if ('amount' in node.value) {
                            return `-${node.value.amount} ${node.value.currencyCode}`;
                          } else if ('percentage' in node.value) {
                            return `-${node.value.percentage}%`;
                          }
                          return null;
                        })}
                      </span>
                    </div>
                  )}

                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>{t('total')}</span>
                  <span>
                    {order.totalPriceSet.presentmentMoney.amount}{' '}
                    {order.totalPriceSet.presentmentMoney.currencyCode}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
