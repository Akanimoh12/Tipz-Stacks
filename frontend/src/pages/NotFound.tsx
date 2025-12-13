import React from 'react';
import { Link } from 'react-router-dom';
import { Heading, Paragraph } from '../components/common/Typography';
import { Card, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardBody className="py-12">
          <div className="mb-6">
            <Heading level={1} className="text-6xl font-bold text-[#FF6B35] mb-2">
              404
            </Heading>
            <Heading level={2} className="mb-4">
              Page Not Found
            </Heading>
            <Paragraph color="secondary">
              The page you're looking for doesn't exist or has been moved.
            </Paragraph>
          </div>

          <div className="flex gap-3 justify-center">
            <Link to="/">
              <Button>Go Home</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default NotFound;
