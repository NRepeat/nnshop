import getContactInfo from '@features/checkout/contact-info/api/get-contact-info';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card';
import Image from 'next/image';

import contactInfoImage from '@shared/assets/ContactInfo.svg';
import placeholderLine from '@shared/assets/placeholder-line.svg';
import PlaceHolderLine from '@shared/assets/PlaceHolderLine';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip';
import Link from 'next/link';
import ContactInfo from '@shared/assets/ContactInfo';
import { getDeliveryInfo } from '@features/checkout/delivery/api/getDeliveryInfo';
import DeliveryInfo from '@shared/assets/DeliveryInfo';

export default async function Receipt() {
  const contactInfo = await getContactInfo();
  const deliveryInfo = await getDeliveryInfo();
  return (
    <div className="flex flex-col items-center  w-full container">
      <Card className="w-full shadow-none rounded-none  bg-gray-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className=" text-center px-2">
          <div className="flex flex-col items-center justify-center space-y-2 ">
            {/*<h3 className="text-lg font-semibold">Contact Information</h3>*/}
            {contactInfo ? (
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Link href={'/checkout/info'} className="w-full">
                    <div className="flex justify-start p-2.5 py-0.5 w-full bg-white  gap-2 border border-gray-300 items-center ">
                      <ContactInfo />
                      <div className="flex flex-col text-start justify-start space-y-1  w-full">
                        <p className="text-gray-700 text-overflow-ellipsis">
                          <span className="font-semibold">Name: </span>
                          {contactInfo.name}
                        </p>
                        <p className="text-gray-700 text-overflow-ellipsis">
                          <span className="font-semibold">Email: </span>
                          {contactInfo.email}
                        </p>
                        <p className="text-gray-700 text-overflow-ellipsis">
                          <span className="font-semibold">Phone: </span>
                          {contactInfo.phone}
                        </p>
                      </div>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Contact information</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <PlaceHolder toolTipDescription="Contact information">
                <ContactInfo />
              </PlaceHolder>
            )}
            {deliveryInfo ? (
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Link href={'/checkout/info'} className="w-full">
                    <div className="flex justify-start p-2.5 py-0.5 w-full bg-white  gap-2 border border-gray-300 items-center ">
                      <DeliveryInfo />
                      {deliveryInfo.novaPoshtaDepartment ? (
                        <div className="flex flex-col text-start justify-start space-y-1  w-full">
                          <p className="text-gray-700 text-overflow-ellipsis">
                            <span className="font-semibold"> </span>
                            {deliveryInfo.novaPoshtaDepartment.shortName}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col text-start justify-start space-y-1  w-full">
                          <p className="text-gray-700 text-overflow-ellipsis">
                            <span className="font-semibold"> </span>
                            {deliveryInfo.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p> Delivery information</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <PlaceHolder toolTipDescription="Delivery information">
                <DeliveryInfo />
              </PlaceHolder>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const PlaceHolder = ({
  children,
  toolTipDescription,
}: {
  children: React.ReactNode;
  toolTipDescription: string;
}) => {
  return (
    <div className="flex justify-start p-2.5 w-full  gap-2   ">
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{toolTipDescription}</p>
        </TooltipContent>
      </Tooltip>
      <div className="flex flex-col text-start justify-evenly py-4  w-full">
        <PlaceHolderLine />
        <PlaceHolderLine />
        <PlaceHolderLine />
        <PlaceHolderLine />
        <PlaceHolderLine />
      </div>
    </div>
  );
};
