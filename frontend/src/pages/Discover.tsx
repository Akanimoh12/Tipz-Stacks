import React from 'react';
import { Heading, Paragraph } from '../components/common/Typography';
import { Card, CardHeader, CardBody } from '../components/common/Card';

const Discover: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <Heading level={1} className="mb-2">
          Discover Creators
        </Heading>
        <Paragraph color="secondary">
          Browse and support amazing creators on the Stacks blockchain.
        </Paragraph>
      </div>

      <Card>
        <CardHeader>
          <Heading level={3}>Coming Soon</Heading>
        </CardHeader>
        <CardBody>
          <Paragraph color="secondary">
            Creator discovery feature will be implemented in Prompt 8.
          </Paragraph>
        </CardBody>
      </Card>
    </div>
  );
};

export default Discover;
