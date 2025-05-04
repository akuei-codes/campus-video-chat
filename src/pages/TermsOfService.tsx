
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Separator } from "@/components/ui/separator";

const TermsOfService: React.FC = () => {
  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-ivy mb-6">Terms of Service</h1>
        <Separator className="mb-6" />
        
        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using our video chat application for Ivy League students, 
              you agree to be bound by these Terms of Service and all applicable laws and regulations. 
              If you do not agree with any of these terms, you are prohibited from using this service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. User Eligibility</h2>
            <p>
              This application is intended for use by current students or alumni of Ivy League universities.
              Users must be at least 18 years of age. By using this service, you represent and warrant that you
              meet these eligibility requirements.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
            <p>
              When using our service, you agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>Harass, intimidate, or threaten other users</li>
              <li>Share inappropriate, offensive, or illegal content</li>
              <li>Impersonate another person or entity</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for any illegal purpose</li>
              <li>Share personally identifiable information of others without consent</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Video Chat Rules</h2>
            <p>
              During video chat sessions, users must comply with the following rules:
            </p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>No inappropriate or offensive behavior</li>
              <li>No sharing of explicit content</li>
              <li>No recording of video chat sessions without consent</li>
              <li>No distribution of content from video chat sessions</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to our service at any time,
              without notice, for conduct that we believe violates these Terms of Service or is harmful
              to other users, us, or third parties, or for any other reason at our sole discretion.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Changes to Terms</h2>
            <p>
              We may revise these Terms of Service at any time without notice. By continuing to use
              the service after such revisions are posted, you agree to be bound by the revised terms.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
            <p>
              This service is provided "as is" without warranties of any kind, either express or implied.
              We do not warrant that the service will be uninterrupted or error-free.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at support@ivyleaguechat.com.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsOfService;
