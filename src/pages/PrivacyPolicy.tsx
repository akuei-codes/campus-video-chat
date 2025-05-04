
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy: React.FC = () => {
  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-ivy mb-6">Privacy Policy</h1>
        <Separator className="mb-6" />
        
        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p>
              When you use our Ivy League video chat application, we collect the following types of information:
            </p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>
                <strong>Account Information:</strong> When you create an account, we collect your email address,
                name, and authentication information.
              </li>
              <li>
                <strong>Profile Information:</strong> Information you provide in your profile, such as your
                university affiliation, graduation year, major, gender, interests, and profile photos.
              </li>
              <li>
                <strong>Usage Information:</strong> Information about how you use the application, including
                connection time, features used, and user interactions.
              </li>
              <li>
                <strong>Technical Information:</strong> Device information, IP address, browser type, and
                operating system information.
              </li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p>
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>To provide and maintain our service</li>
              <li>To match you with other users based on your preferences</li>
              <li>To improve our application and user experience</li>
              <li>To communicate with you about updates or changes to our service</li>
              <li>To enforce our Terms of Service and moderate content</li>
              <li>To respond to user inquiries and support requests</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Video Chat Privacy</h2>
            <p>
              Our video chat functionality operates on a peer-to-peer basis using WebRTC. We do not record or
              store the content of your video or audio conversations. However, we do maintain logs of connection
              metadata such as participant IDs, timestamps, and connection duration for service quality and
              security purposes.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no
              method of transmission over the Internet or electronic storage is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
            <p>
              We do not sell your personal information. We may share information in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>With other users as part of the intended functionality of the service</li>
              <li>With service providers who perform services on our behalf</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transaction such as a merger or acquisition</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
            <p>
              Depending on your location, you may have rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>Accessing your personal information</li>
              <li>Correcting inaccurate information</li>
              <li>Deleting your personal information</li>
              <li>Restricting or objecting to certain processing</li>
              <li>Data portability</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@ivyleaguechat.com.
            </p>
          </section>
          
          <div className="mt-10 text-sm text-gray-500">
            Last Updated: May 4, 2025
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicy;
