import React from 'react';
import Card from '../components/Card';
import SectionDivider from '../components/SectionDivider';

const ComponentShowcase: React.FC = () => {
    return (
        <div style={{ width: '100%', padding: '3rem 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                
                <SectionDivider text="SYSTEM ARCHITECTURE" />
                
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '2rem',
                    marginTop: '1.5rem'
                }}>
                    <Card 
                        label="MODULE 01"
                        title="Neural Engine" 
                        description="High-performance processing for real-time behavioral signal analysis." 
                    />
                    <Card 
                        label="MODULE 02"
                        title="Data Vault" 
                        description="Secure, encrypted storage for proprietary AI datasets and models." 
                    />
                    <Card 
                        label="MODULE 03"
                        title="Edge Gateway" 
                        description="Low-latency entry points for distributed microservice communication." 
                    />
                </div>

                <SectionDivider text="UI ELEMENTS" />
                
                <p style={{ color: '#6b7280', textAlign: 'center', fontSize: '11px', letterSpacing: '0.1em', margin: '1.5rem 0 0 0' }}>
                    END-TO-END COMPONENT DESIGN TEST COMPLETE.
                </p>
            </div>
        </div>
    );
};

export default ComponentShowcase;
