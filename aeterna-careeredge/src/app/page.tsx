"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-warm-ivory p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <h1 className="font-heading text-3xl font-bold text-maroon-700">
            Aeterna CareerEdge
          </h1>
          <p className="mt-2 text-secondary-text">
            Reusable UI component testing
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Buttons and Badges</CardTitle>
            <CardDescription>
              Available button and status variants.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="gold">Gold</Button>
              <Button loading>Loading</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success" dot>
                Accepted
              </Badge>
              <Badge variant="warning" dot>
                Pending
              </Badge>
              <Badge variant="error">Rejected</Badge>
              <Badge variant="info">Under Review</Badge>
              <Badge variant="maroon">AI Recommended</Badge>
              <Badge variant="gold">Verified</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>
              Input, textarea and select examples.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Input label="Full name" placeholder="Enter your name" />
            <Input
              label="Email"
              type="email"
              placeholder="student@example.com"
              hint="We'll use this for account communication."
            />
            <Textarea
              label="About you"
              placeholder="Tell us about yourself..."
            />
            <Select
              label="Education level"
              placeholder="Choose education"
              options={[
                { label: "Undergraduate", value: "ug" },
                { label: "Postgraduate", value: "pg" },
                { label: "Diploma", value: "diploma" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile and Progress</CardTitle>
            <CardDescription>Avatar and progress indicator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name="Anuj Dandavate" size="xl" />
              <div>
                <p className="font-semibold text-dark-text">Student Profile</p>
                <p className="text-sm text-secondary-text">Career Passport</p>
              </div>
            </div>
            <Progress value={75} showLabel />
            <Progress value={45} color="gold" showLabel />
            <Progress value={100} color="success" showLabel />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>
              Switch between different content panels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              items={[
                {
                  label: "Overview",
                  value: "overview",
                  content: (
                    <p className="text-sm text-secondary-text">
                      Your career overview appears here.
                    </p>
                  ),
                },
                {
                  label: "Education",
                  value: "education",
                  content: (
                    <p className="text-sm text-secondary-text">
                      Your education details appear here.
                    </p>
                  ),
                },
                {
                  label: "Skills",
                  value: "skills",
                  content: (
                    <p className="text-sm text-secondary-text">
                      Your skills appear here.
                    </p>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
            <CardDescription>
              Open and close an interactive dialog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Welcome to CareerEdge"
              description="This is a reusable modal component."
            >
              <p className="mb-5 text-sm text-secondary-text">
                You can put forms, confirmations or other content here.
              </p>
              <Button fullWidth onClick={() => setModalOpen(false)}>
                Close Modal
              </Button>
            </Modal>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skeleton Loading</CardTitle>
            <CardDescription>Placeholder UI while data loads.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Skeleton variant="circular" />
            <div className="flex-1 space-y-3">
              <Skeleton variant="text" className="w-1/2" />
              <Skeleton variant="text" className="w-3/4" />
            </div>
          </CardContent>
        </Card>

        <p className="pb-6 text-center text-sm text-secondary-text">
          Aeterna CareerEdge · UI Foundation
        </p>
      </div>
    </main>
  );
}
