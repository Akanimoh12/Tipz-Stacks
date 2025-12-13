import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { Heading, Paragraph } from '../components/common/Typography';
import { Card, CardHeader, CardBody } from '../components/common/Card';

const MyProfile: React.FC = () => {
  const { walletAddress } = useWallet();

  return (
    <div>
      <div className="mb-8">
        <Heading level={1} className="mb-2">
          My Profile
        </Heading>
        <Paragraph color="secondary">
          View and manage your creator or tipper profile.
        </Paragraph>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <Heading level={3}>Wallet Information</Heading>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div>
                <Paragraph size="sm" color="secondary" className="mb-1">
                  Wallet Address
                </Paragraph>
                <Paragraph className="font-mono text-sm">
                  {walletAddress}
                </Paragraph>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading level={3}>Coming Soon</Heading>
          </CardHeader>
          <CardBody>
            <Paragraph color="secondary">
              Full profile management will be available in future prompts.
            </Paragraph>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;
