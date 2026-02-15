import React from 'react';
import Card from '../components/Card';
import SectionDivider from '../components/SectionDivider';
import '../styles/ComponentShowcase.css';

const ComponentShowcase: React.FC = () => {
    return (
        <div className="component-showcase">
            <div className="component-showcase-container">
                {/* Added margin-bottom to separate from cards */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <SectionDivider text="SYSTEM ARCHITECTURE" />
                </div>

                <div className="component-showcase-grid">
                    <Card
                        label="MODULE 01"
                        title="Neural Engine"
                        description="Real-time behavioral signal analysis."
                    />
                    <Card
                        label="MODULE 02"
                        title="Data Vault"
                        description="Secure storage for AI datasets."
                    />
                    <Card
                        label="MODULE 03"
                        title="Edge Gateway"
                        description="Distributed microservice communication."
                    />
                </div>

                {/* Added margin-top to separate from cards */}
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <SectionDivider text="UI ELEMENTS" />
                </div>

                <span className="component-showcase-footer-text">
                    END-TO-END COMPONENT DESIGN TEST COMPLETE.
                </span>
            </div>
        </div>
    );
};

export default ComponentShowcase;
