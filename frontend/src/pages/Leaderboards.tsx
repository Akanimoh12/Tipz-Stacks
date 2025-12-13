import React from 'react';
import { Heading, Paragraph } from '../components/common/Typography';
import { Card, CardHeader, CardBody } from '../components/common/Card';

const Leaderboards: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <Heading level={1} className="mb-2">
          Leaderboards
        </Heading>
        <Paragraph color="secondary">
          Top creators and supporters on the platform.
        </Paragraph>
      </div>

      <Card>
        <CardHeader>
          <Heading level={3}>Coming Soon</Heading>
        </CardHeader>
        <CardBody>
          <Paragraph color="secondary">
            Dual leaderboards feature will be implemented in Prompt 11.
          </Paragraph>
        </CardBody>
      </Card>
    </div>
  );
};

export default Leaderboards;
