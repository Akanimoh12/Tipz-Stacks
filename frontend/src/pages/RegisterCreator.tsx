import React from 'react';
import { Heading, Paragraph } from '../components/common/Typography';
import { Card, CardHeader, CardBody } from '../components/common/Card';

const RegisterCreator: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <Heading level={1} className="mb-2">
          Become a Creator
        </Heading>
        <Paragraph color="secondary">
          Register as a creator and start receiving tips and cheers from your supporters.
        </Paragraph>
      </div>

      <Card>
        <CardHeader>
          <Heading level={3}>Creator Registration</Heading>
        </CardHeader>
        <CardBody>
          <Paragraph color="secondary">
            Creator registration flow will be implemented in Prompt 10.
          </Paragraph>
        </CardBody>
      </Card>
    </div>
  );
};

export default RegisterCreator;
