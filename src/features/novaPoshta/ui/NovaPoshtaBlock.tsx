import React, { useState } from 'react';
import NovaPoshtaButton from './NovaPoshtaButton';
import NovapostForm from './NovapostForm';

const NovaPoshtaBlock = (props: { privatKey: string }) => {
  const { privatKey } = props;

  return <NovapostForm privateKey={privatKey} />;
};

export default NovaPoshtaBlock;
