import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: March 31, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            1. Information We Collect
          </h2>
          <h3 className="mb-1.5 text-sm font-semibold text-foreground">
            Account Information
          </h3>
          <p>
            When you create an account, we collect your name, email address, and
            authentication method (email/password or Google). If you sign in with
            Google, we receive your Google profile name, email, and profile photo
            URL.
          </p>

          <h3 className="mb-1.5 mt-4 text-sm font-semibold text-foreground">
            Payment Information
          </h3>
          <p>
            Payments are processed by{" "}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Stripe
            </a>
            . We do not store your credit card number, CVC, or billing address.
            We store your Stripe customer ID to manage your subscription.
          </p>

          <h3 className="mb-1.5 mt-4 text-sm font-semibold text-foreground">
            Usage Data
          </h3>
          <p>
            We track which lessons you have completed and which resources you
            have favorited. This data is tied to your user ID and used to provide
            progress tracking and personalized features.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Authenticate you and manage your account</li>
            <li>Process payments and manage subscriptions</li>
            <li>Track your course progress and favorites</li>
            <li>Send transactional emails (purchase confirmations, etc.)</li>
            <li>Improve the Platform</li>
          </ul>
          <p className="mt-3">
            We do <strong className="text-foreground">not</strong> sell your
            personal data. We do <strong className="text-foreground">not</strong>{" "}
            use your data for advertising.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            3. Third-Party Services
          </h2>
          <p>We use the following third-party services:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Firebase Authentication</strong>{" "}
              — identity management and session tokens
            </li>
            <li>
              <strong className="text-foreground">Cloud Firestore</strong> —
              database for user data, enrollments, and progress
            </li>
            <li>
              <strong className="text-foreground">Stripe</strong> — payment
              processing and subscription management
            </li>
            <li>
              <strong className="text-foreground">Vimeo</strong> — video hosting
              (embedded with DNT enabled and cookies disabled)
            </li>
            <li>
              <strong className="text-foreground">Vercel</strong> — hosting and
              deployment
            </li>
          </ul>
          <p className="mt-3">
            Each service has its own privacy policy. We configure these services
            to minimize data collection where possible (e.g., Vimeo DNT mode,
            YouTube no-cookie domain).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            4. Cookies
          </h2>
          <p>
            We use a single HttpOnly session cookie (<code className="rounded bg-muted px-1.5 py-0.5 text-xs">__session</code>)
            for authentication. This cookie is essential for the Platform to
            function and cannot be opted out of. We do not use tracking cookies,
            analytics cookies, or advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            5. Data Retention
          </h2>
          <p>
            Your data is retained as long as your account is active. When you
            delete your account, all personal data, progress, favorites, and
            enrollment records are permanently removed from our systems. Stripe
            may retain payment transaction records as required by financial
            regulations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            6. Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Access</strong> your data — visible on your{" "}
              <Link href="/settings" className="text-primary hover:underline">
                Settings
              </Link>{" "}
              page
            </li>
            <li>
              <strong className="text-foreground">Delete</strong> your account and all associated data at any time from
              Settings
            </li>
            <li>
              <strong className="text-foreground">Cancel</strong> your subscription at any time
            </li>
            <li>
              <strong className="text-foreground">Export</strong> — contact us for a copy of your data
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            7. Security
          </h2>
          <p>
            We implement security measures including: HttpOnly session cookies
            with server-side verification, Stripe webhook signature validation,
            server-side access control for all content, input validation on all
            user-supplied data, security headers (HSTS, X-Frame-Options,
            X-Content-Type-Options), and Firestore security rules denying all
            client-side access.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            8. Children&rsquo;s Privacy
          </h2>
          <p>
            The Platform is not intended for children under 13. We do not
            knowingly collect personal information from children under 13. If you
            believe a child has provided us with personal data, please contact us
            and we will delete it.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            9. Changes to This Policy
          </h2>
          <p>
            We may update this policy from time to time. Material changes will be
            communicated via email or a notice on the Platform.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            10. Contact
          </h2>
          <p>
            Privacy questions? Reach out via{" "}
            <a
              href="https://discord.gg/STGMCZVxUx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Discord
            </a>{" "}
            or through the links on our{" "}
            <Link href="/about" className="text-primary hover:underline">
              About
            </Link>{" "}
            page.
          </p>
        </section>
      </div>
    </main>
  );
}
