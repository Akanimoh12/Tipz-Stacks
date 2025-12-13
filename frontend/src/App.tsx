import { Button } from '@components/common/Button'
import { Card, CardHeader, CardBody, CardFooter } from '@components/common/Card'
import { Heading, Paragraph } from '@components/common/Typography'

function App() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container-custom max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Heading level={1} className="mb-4">
            Welcome to <span className="text-gradient">Tipz</span>
          </Heading>
          <Paragraph size="large" color="light">
            Empowering creators on the Stacks blockchain
          </Paragraph>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <Card variant="default" hover>
            <CardHeader>
              <Heading level={3}>Default Card</Heading>
            </CardHeader>
            <CardBody>
              <Paragraph>
                This is a default card with hover effect. Perfect for creator profiles.
              </Paragraph>
            </CardBody>
            <CardFooter>
              <Button variant="primary" size="small">
                View Profile
              </Button>
            </CardFooter>
          </Card>

          <Card variant="highlighted">
            <CardHeader>
              <Heading level={3}>Highlighted Card</Heading>
            </CardHeader>
            <CardBody>
              <Paragraph>
                Featured cards use the accent border to draw attention.
              </Paragraph>
            </CardBody>
            <CardFooter>
              <Button variant="secondary" size="small">
                Learn More
              </Button>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <Heading level={3}>Elevated Card</Heading>
            </CardHeader>
            <CardBody>
              <Paragraph>
                Elevated cards have a stronger shadow for emphasis.
              </Paragraph>
            </CardBody>
          </Card>

          <Card variant="default">
            <CardHeader>
              <Heading level={3}>Interactive Card</Heading>
            </CardHeader>
            <CardBody>
              <Paragraph className="mb-4">
                Cards can contain any content and multiple buttons.
              </Paragraph>
              <div className="flex gap-2">
                <Button variant="primary" size="small">
                  Primary
                </Button>
                <Button variant="ghost" size="small">
                  Ghost
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Heading level={2} className="mb-6">
            Button Variants
          </Heading>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <Button variant="primary" size="small">Small</Button>
            <Button variant="primary" size="medium">Medium</Button>
            <Button variant="primary" size="large">Large</Button>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <Button variant="primary" loading>Loading...</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
