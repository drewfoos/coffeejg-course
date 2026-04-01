import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: March 31, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p>
            By creating an account on CoffeeJG (&ldquo;the Platform&rdquo;), you
            agree to be bound by these Terms of Service and our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            . If you do not agree, do not create an account or use the Platform.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            2. Account Registration
          </h2>
          <p>
            You must provide accurate information when creating an account. You
            are responsible for maintaining the security of your account
            credentials. You must be at least 13 years old to use the Platform.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            3. Paid Subscriptions &amp; Purchases
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Monthly Subscription:</strong>{" "}
              Billed automatically each billing period until you cancel. You may
              cancel at any time from your{" "}
              <Link href="/settings" className="text-primary hover:underline">
                Settings
              </Link>{" "}
              page. Upon cancellation, you retain access until the end of the
              current billing period.
            </li>
            <li>
              <strong className="text-foreground">Lifetime Access:</strong> A
              one-time payment that grants permanent access to all current and
              future course content. No recurring charges.
            </li>
            <li>
              All payments are processed by{" "}
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Stripe
              </a>
              . We do not store your credit card information.
            </li>
            <li>
              By purchasing a subscription, you authorize recurring charges to
              your payment method at the applicable rate until you cancel.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            4. Refund Policy
          </h2>
          <p>
            Refund requests are handled on a case-by-case basis. If you are
            unsatisfied with a purchase, contact us within 7 days for a review.
            Refunds for monthly subscriptions apply only to the most recent
            billing period.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            5. Content &amp; Intellectual Property
          </h2>
          <p>
            All course content (videos, articles, graphics) is owned by CoffeeJG
            and protected by copyright. Your purchase grants you a personal,
            non-transferable license to access the content. You may not
            redistribute, resell, or publicly share course materials.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            6. Resource Hub
          </h2>
          <p>
            The Resource Hub aggregates links to third-party VTuber assets. We do
            not host, own, or guarantee the availability of these assets. Each
            asset is subject to its creator&rsquo;s own license terms. We are not
            responsible for the content, quality, or licensing of third-party
            resources.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            7. Account Deletion
          </h2>
          <p>
            You may delete your account at any time from the{" "}
            <Link href="/settings" className="text-primary hover:underline">
              Settings
            </Link>{" "}
            page. Account deletion is permanent and will: cancel any active
            subscriptions immediately, remove all personal data, course progress,
            favorites, and purchase records from our systems, and delete your
            authentication account. Stripe may retain payment records as required
            by financial regulations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            8. Acceptable Use
          </h2>
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Share your account credentials with others</li>
            <li>Attempt to access content you have not purchased</li>
            <li>Scrape, download, or redistribute course videos</li>
            <li>Use the Platform for any unlawful purpose</li>
            <li>Interfere with the Platform&rsquo;s operation or security</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            9. Limitation of Liability
          </h2>
          <p>
            The Platform is provided &ldquo;as is&rdquo; without warranties of
            any kind. We are not liable for any indirect, incidental, or
            consequential damages arising from your use of the Platform. Our
            total liability is limited to the amount you paid in the 12 months
            preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            10. Changes to These Terms
          </h2>
          <p>
            We may update these terms from time to time. If we make material
            changes, we will notify users via email or a notice on the Platform.
            Continued use after changes constitutes acceptance of the updated
            terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            11. Contact
          </h2>
          <p>
            Questions about these terms? Reach out via{" "}
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
