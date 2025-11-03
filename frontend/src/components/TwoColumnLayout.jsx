// blog-application/frontend/src/components/TwoColumnLayout.jsx
'use client';

// Simple grid layout for main content and sidebar
const TwoColumnLayout = ({ mainContent, sidebarContent }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content (Wide Column: takes 8 out of 12 columns on large screens) */}
            <div className="lg:col-span-8">
                {mainContent}
            </div>

            {/* Sidebar Content (Narrow Column: takes 4 out of 12 columns on large screens) */}
            <aside className="lg:col-span-4 space-y-6">
                {sidebarContent}
            </aside>
        </div>
    );
};

export default TwoColumnLayout;