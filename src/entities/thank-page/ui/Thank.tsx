import { Aguafina_Script } from 'next/font/google';
import React from 'react';

const kings = Aguafina_Script({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-bilbo',
});

export const Thank = async ({ orderId }: { orderId: string }) => {
  const order = await getOrder({ orderId });
  const checkoutData = await getCompleteCheckoutData();

  return (
    <div className="min-h-screen ">
      <div className=" mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`${kings.className} text-4xl text-[#325039] mb-4`}>
            NN CLOTHES
          </div>
          <p className="text-sm text-gray-600 mb-8">New wheels, new feels</p>
        </div>

        <div className="flex   gap-8 w-full justify-items-center">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Thank You Message */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Thank you, {checkoutData?.contactInfo?.name || 'Customer'}!
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Confirmation #{order?.orderId || 'N/A'}
              </p>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Your order is confirmed
              </h2>
              <p className="text-gray-600">
                You&apos;ll receive a confirmation email with your order number
                shortly.
              </p>
            </div>

            {/* Map Section */}
            <Card className="overflow-hidden">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Map will be displayed here</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#325039]" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Shipping address
                    </p>
                    <p className="text-sm text-gray-600">
                      {checkoutData?.deliveryInfo?.deliveryMethod ===
                      'novaPoshta'
                        ? `Nova Poshta: ${checkoutData.deliveryInfo.novaPoshtaDepartment?.shortName || 'Department'}`
                        : `${checkoutData?.deliveryInfo?.address || 'Address'}, ${checkoutData?.deliveryInfo?.city || 'City'}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Continue Shopping Button */}
            <div className="text-center">
              <Button
                asChild
                className="bg-[#325039] hover:bg-[#2a4330] text-white px-8 py-3 text-lg"
              >
                <Link href="/">Continue shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
