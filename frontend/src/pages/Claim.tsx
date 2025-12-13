import React from 'react';
import { Heading, Paragraph } from '../components/common/Typography';
import ClaimWidget from '../components/dashboard/ClaimWidget';

const Claim: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <Heading level={1} className="mb-2">
          Claim CHEER Tokens
        </Heading>
        <Paragraph color="secondary">
          Claim your daily CHEER tokens to tip and support creators.
        </Paragraph>
      </div>

      <ClaimWidget />
    </div>
  );
};

export default Claim;
