export function PrivacyPolicyPage() {
    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', lineHeight: 1.6 }}>
            <h1>Privacy Policy</h1>
            <p>
                <em>Last updated: August 20, 2026</em>
            </p>

            <p>
                Everly ("we", "our", "the app") is a personal list-keeping app available on the web and as a native mobile app. This page explains what information we collect, why, and how it's
                handled.
            </p>

            <h2>Information we collect</h2>
            <ul>
                <li>
                    <strong>Account information</strong>: your name and email address, provided when you register. Your password is stored as a one-way cryptographic hash — we never store or have
                    access to your actual password.
                </li>
                <li>
                    <strong>Content you add</strong>: the items you create (title, description, notes, category, importance rating), and any photos you attach to them.
                </li>
                <li>
                    <strong>Location information</strong>: if you enter an address for an item, we store the resulting coordinates and place name. This is only ever entered manually by you — the app
                    does not access your device's GPS or track your location automatically.
                </li>
            </ul>

            <h2>How we use this information</h2>
            <p>
                Your account information and content are used solely to provide the app's core functionality: letting you create, view, and manage your own list of items across devices. We do not sell
                your data, and we do not use it for advertising or share it with third parties for marketing purposes.
            </p>

            <h2>Where your data is stored</h2>
            <p>
                Account and item data is stored in a hosted database. Photos are stored in a hosted file storage service. Both are operated by third-party infrastructure providers who host the data on
                our behalf and do not have independent access to it for their own purposes.
            </p>

            <h2>Data retention and deletion</h2>
            <p>
                Your data is retained for as long as your account exists. If you delete an item, it is permanently removed. If you would like your account and all associated data deleted entirely,
                contact us using the email below and we will process the request.
            </p>

            <h2>Camera and photo library access (mobile app)</h2>
            <p>
                The mobile app requests access to your camera and photo library only when you choose to add a photo to an item. Photos are only uploaded when you explicitly attach them — the app does
                not access your camera or photo library in the background or without your action.
            </p>

            <h2>Children's privacy</h2>
            <p>Everly is not directed at children under 13, and we do not knowingly collect data from them.</p>

            <h2>Changes to this policy</h2>
            <p>If this policy changes, we'll update the "last updated" date above. Continued use of the app after a change constitutes acceptance of the updated policy.</p>

            <h2>Contact</h2>
            <p>
                Questions about this policy, or requests regarding your data, can be sent to <a href="mailto:info@everlylist.com">info@everlylist.com</a>.
            </p>
        </div>
    );
}
