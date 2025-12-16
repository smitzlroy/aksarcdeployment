/**
 * Compliance Attestation Report Generator
 * Generates professional PDF reports for auditors and compliance officers
 */

class ComplianceReportGenerator {
    constructor() {
        this.reportData = null;
    }

    /**
     * Generate compliance attestation report
     */
    async generateReport(deploymentPlan, securityResult, categoryBreakdown, gapAnalysis) {
        this.reportData = {
            deploymentPlan,
            securityResult,
            categoryBreakdown,
            gapAnalysis,
            generatedDate: new Date().toISOString(),
            reportVersion: '1.0'
        };

        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF library not loaded');
            alert('PDF library not loaded. Please refresh the page and try again.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let yPos = 20;

        // Page 1: Executive Summary
        yPos = this.addExecutiveSummary(doc, yPos);
        
        // Page 2: Compliance Overview
        doc.addPage();
        yPos = 20;
        yPos = this.addComplianceOverview(doc, yPos);

        // Page 3: Control Evidence Matrix
        doc.addPage();
        yPos = 20;
        yPos = this.addControlEvidenceMatrix(doc, yPos);

        // Page 4: Security Configuration Details
        doc.addPage();
        yPos = 20;
        yPos = this.addSecurityConfiguration(doc, yPos);

        // Page 5: Category Breakdown
        doc.addPage();
        yPos = 20;
        yPos = this.addCategoryBreakdown(doc, yPos);

        // Page 6: Gap Analysis
        if (gapAnalysis && gapAnalysis.frameworks.length > 0) {
            doc.addPage();
            yPos = 20;
            yPos = this.addGapAnalysis(doc, yPos);
        }

        // Page 7: Continuous Compliance Plan
        doc.addPage();
        yPos = 20;
        yPos = this.addContinuousCompliancePlan(doc, yPos);

        // Page 8: Attestation & Signatures
        doc.addPage();
        yPos = 20;
        yPos = this.addAttestationPage(doc, yPos);

        // Add footer to all pages
        this.addFooters(doc);

        // Save PDF
        const fileName = `Compliance_Attestation_${deploymentPlan.clusterName}_${this.getDateString()}.pdf`;
        doc.save(fileName);

        console.log('✅ Compliance attestation report generated:', fileName);
        return fileName;
    }

    /**
     * Add executive summary page
     */
    addExecutiveSummary(doc, yPos) {
        const plan = this.reportData.deploymentPlan;
        const security = this.reportData.securityResult;

        // Title
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Compliance Attestation Report', 105, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text('Azure Kubernetes Service Arc-enabled Deployment', 105, yPos, { align: 'center' });
        yPos += 20;

        // Reset color
        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        // Deployment Information Box
        doc.setDrawColor(0, 120, 212);
        doc.setFillColor(240, 248, 255);
        doc.rect(15, yPos, 180, 45, 'FD');
        yPos += 10;

        doc.setFont('helvetica', 'bold');
        doc.text('Deployment Information', 20, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        
        doc.text(`Cluster Name: ${plan.clusterName}`, 20, yPos);
        yPos += 6;
        doc.text(`Resource Group: ${plan.resourceGroup}`, 20, yPos);
        yPos += 6;
        doc.text(`Location: ${plan.location}`, 20, yPos);
        yPos += 6;
        doc.text(`Environment: ${plan.environment?.name || 'Custom'}`, 20, yPos);
        yPos += 6;
        doc.text(`Industry: ${plan.industryDetails?.name || 'Not specified'}`, 20, yPos);
        yPos += 15;

        // Compliance Score Box
        const scoreColor = this.getScoreColor(security.score);
        doc.setDrawColor(scoreColor.r, scoreColor.g, scoreColor.b);
        doc.setFillColor(scoreColor.r, scoreColor.g, scoreColor.b, 0.1);
        doc.rect(15, yPos, 180, 35, 'FD');
        yPos += 10;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Overall Compliance Score', 20, yPos);
        yPos += 10;

        doc.setFontSize(32);
        doc.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b);
        doc.text(`${security.score}/100`, 105, yPos, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(0);
        yPos += 10;
        doc.text(`Rating: ${this.getRatingText(security.rating)}`, 105, yPos, { align: 'center' });
        yPos += 15;

        // Reset
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        // Summary Statistics
        doc.setFont('helvetica', 'bold');
        doc.text('Compliance Summary', 20, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');

        doc.text(`Security Checks Passed: ${security.passedChecks} / ${security.totalChecks}`, 20, yPos);
        yPos += 6;
        doc.text(`Security Points Earned: ${security.totalPoints} / ${security.maxPoints}`, 20, yPos);
        yPos += 6;

        if (this.reportData.gapAnalysis) {
            const totalControls = this.reportData.gapAnalysis.frameworks.reduce(
                (sum, fw) => sum + fw.totalCount, 0
            );
            const compliantControls = this.reportData.gapAnalysis.frameworks.reduce(
                (sum, fw) => sum + fw.compliantCount, 0
            );
            doc.text(`Regulatory Controls Met: ${compliantControls} / ${totalControls}`, 20, yPos);
            yPos += 6;
        }

        doc.text(`Report Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, yPos);
        yPos += 6;
        doc.text(`Report Version: ${this.reportData.reportVersion}`, 20, yPos);

        return yPos;
    }

    /**
     * Add compliance overview page
     */
    addComplianceOverview(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Regulatory Compliance Overview', 20, yPos);
        yPos += 12;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        if (!this.reportData.gapAnalysis || !this.reportData.deploymentPlan.industryDetails) {
            doc.text('No industry-specific compliance requirements selected.', 20, yPos);
            yPos += 10;
            doc.text('This deployment follows general security best practices for Kubernetes.', 20, yPos);
            return yPos + 10;
        }

        const industry = this.reportData.deploymentPlan.industryDetails;
        doc.setFont('helvetica', 'bold');
        doc.text(`Industry: ${industry.name}`, 20, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const description = doc.splitTextToSize(industry.description, 170);
        doc.text(description, 20, yPos);
        yPos += description.length * 5 + 5;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Applicable Regulatory Frameworks', 20, yPos);
        yPos += 8;

        // Framework compliance table
        this.reportData.gapAnalysis.frameworks.forEach(framework => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(framework.name, 20, yPos);
            yPos += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            
            const fwDesc = doc.splitTextToSize(framework.description, 160);
            doc.text(fwDesc, 25, yPos);
            yPos += fwDesc.length * 5;

            // Compliance percentage
            const compliancePercent = framework.compliancePercentage;
            const color = this.getScoreColor(compliancePercent);
            
            doc.setTextColor(color.r, color.g, color.b);
            doc.setFont('helvetica', 'bold');
            doc.text(`Compliance: ${compliancePercent}% (${framework.compliantCount}/${framework.totalCount} controls)`, 25, yPos);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'normal');
            yPos += 8;

            // Scope
            doc.text(`Scope: ${framework.scope}`, 25, yPos);
            yPos += 10;

            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
        });

        // Official Sources
        yPos += 5;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        doc.text('All framework requirements sourced from official regulatory bodies.', 20, yPos);
        yPos += 5;
        doc.text('See COMPLIANCE_SOURCES.md in repository for detailed references.', 20, yPos);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');

        return yPos + 10;
    }

    /**
     * Add control evidence matrix
     */
    addControlEvidenceMatrix(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Control Evidence Matrix', 20, yPos);
        yPos += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('This matrix maps security configurations to specific regulatory control requirements.', 20, yPos);
        yPos += 10;

        // Table header
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(0, 120, 212);
        doc.setTextColor(255);
        doc.rect(15, yPos - 5, 180, 8, 'F');
        
        doc.text('Security Check', 17, yPos);
        doc.text('Status', 95, yPos);
        doc.text('Regulatory Controls', 115, yPos);
        yPos += 8;

        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');

        // Table rows
        this.reportData.securityResult.checks.forEach((check, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
                // Repeat header
                doc.setFont('helvetica', 'bold');
                doc.setFillColor(0, 120, 212);
                doc.setTextColor(255);
                doc.rect(15, yPos - 5, 180, 8, 'F');
                doc.text('Security Check', 17, yPos);
                doc.text('Status', 95, yPos);
                doc.text('Regulatory Controls', 115, yPos);
                yPos += 8;
                doc.setTextColor(0);
                doc.setFont('helvetica', 'normal');
            }

            // Alternate row colors
            if (index % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(15, yPos - 5, 180, 10, 'F');
            }

            // Check name
            const checkName = doc.splitTextToSize(check.name, 75);
            doc.text(checkName, 17, yPos);

            // Status
            const statusText = check.passed ? '✓ Met' : '✗ Gap';
            const statusColor = check.passed ? { r: 16, g: 124, b: 16 } : { r: 164, g: 38, b: 44 };
            doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
            doc.text(statusText, 95, yPos);
            doc.setTextColor(0);

            // Controls
            if (check.compliance && check.compliance.length > 0) {
                const controls = check.compliance.join(', ');
                const controlText = doc.splitTextToSize(controls, 75);
                doc.setFontSize(8);
                doc.text(controlText, 115, yPos);
                doc.setFontSize(10);
                yPos += Math.max(checkName.length * 5, controlText.length * 4);
            } else {
                doc.text('General security', 115, yPos);
                yPos += checkName.length * 5;
            }

            yPos += 2;
        });

        return yPos + 10;
    }

    /**
     * Add security configuration details
     */
    addSecurityConfiguration(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Security Configuration Evidence', 20, yPos);
        yPos += 12;

        const plan = this.reportData.deploymentPlan;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Infrastructure Configuration', 20, yPos);
        yPos += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const configItems = [
            ['Control Plane Nodes', `${plan.controlPlaneNodes} nodes (HA: ${plan.controlPlaneNodes >= 3 ? 'Yes' : 'No'})`],
            ['Worker Nodes', `${plan.totalNodes} nodes across ${plan.nodePools.length} pool(s)`],
            ['Availability Sets', plan.enableAvailabilitySets ? 'Enabled' : 'Disabled'],
            ['Auto-scaling', plan.enableAutoScaling ? 'Enabled' : 'Disabled'],
            ['Monitoring', plan.enableMonitoring ? 'Azure Monitor enabled' : 'Not configured'],
            ['Backup', plan.backupEnabled ? 'Configured' : 'Not configured']
        ];

        configItems.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${label}:`, 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 80, yPos);
            yPos += 6;
        });

        yPos += 10;

        // Node Pools detail
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Node Pool Configuration', 20, yPos);
        yPos += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        plan.nodePools.forEach((pool, index) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`Pool ${index + 1}: ${pool.name}`, 20, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');

            doc.text(`VM SKU: ${pool.vmSize}`, 25, yPos);
            yPos += 5;
            doc.text(`Node Count: ${pool.nodeCount}`, 25, yPos);
            yPos += 5;
            doc.text(`OS: ${pool.osType}`, 25, yPos);
            yPos += 5;
            
            if (pool.mode) {
                doc.text(`Mode: ${pool.mode}`, 25, yPos);
                yPos += 5;
            }

            if (pool.taints && pool.taints.length > 0) {
                doc.text(`Taints: ${pool.taints.join(', ')}`, 25, yPos);
                yPos += 5;
            }

            yPos += 5;

            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
        });

        return yPos + 10;
    }

    /**
     * Add category breakdown
     */
    addCategoryBreakdown(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Security Category Analysis', 20, yPos);
        yPos += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Security posture broken down by category:', 20, yPos);
        yPos += 10;

        if (!this.reportData.categoryBreakdown) {
            doc.text('Category breakdown not available.', 20, yPos);
            return yPos + 10;
        }

        Object.keys(this.reportData.categoryBreakdown).forEach(key => {
            const category = this.reportData.categoryBreakdown[key];
            const color = this.getScoreColor(category.percentage);

            // Category box
            doc.setDrawColor(color.r, color.g, color.b);
            doc.setFillColor(color.r, color.g, color.b, 0.1);
            doc.rect(15, yPos - 5, 180, 25, 'FD');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(category.name, 20, yPos);
            yPos += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Score: ${category.earnedPoints}/${category.maxPoints} points (${category.percentage}%)`, 20, yPos);
            yPos += 6;
            doc.text(`Checks Passed: ${category.checks.filter(c => c.passed).length}/${category.checks.length}`, 20, yPos);
            yPos += 6;
            doc.text(`Status: ${this.getRatingText(category.status)}`, 20, yPos);
            yPos += 12;

            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
        });

        return yPos + 10;
    }

    /**
     * Add gap analysis
     */
    addGapAnalysis(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Compliance Gap Analysis', 20, yPos);
        yPos += 12;

        if (!this.reportData.gapAnalysis) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('No gap analysis available.', 20, yPos);
            return yPos + 10;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        this.reportData.gapAnalysis.frameworks.forEach(framework => {
            if (yPos > 240) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(framework.name, 20, yPos);
            yPos += 7;

            const color = this.getScoreColor(framework.compliancePercentage);
            doc.setTextColor(color.r, color.g, color.b);
            doc.text(`${framework.compliancePercentage}% Compliant`, 20, yPos);
            doc.setTextColor(0);
            yPos += 8;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            if (framework.gapCount > 0) {
                doc.setFont('helvetica', 'bold');
                doc.text(`Gaps Found: ${framework.gapCount}`, 20, yPos);
                yPos += 6;
                doc.setFont('helvetica', 'normal');

                const gaps = framework.controls.filter(c => c.status === 'non-compliant');
                gaps.slice(0, 5).forEach(gap => {
                    doc.text(`• ${gap.controlId}: ${gap.checkName}`, 25, yPos);
                    yPos += 5;
                });

                if (gaps.length > 5) {
                    doc.setFont('helvetica', 'italic');
                    doc.text(`... and ${gaps.length - 5} more gaps`, 25, yPos);
                    doc.setFont('helvetica', 'normal');
                    yPos += 5;
                }
            } else {
                doc.setTextColor(16, 124, 16);
                doc.text('✓ Fully Compliant - No gaps found', 20, yPos);
                doc.setTextColor(0);
                yPos += 6;
            }

            yPos += 8;
        });

        return yPos + 10;
    }

    /**
     * Add continuous compliance plan
     */
    addContinuousCompliancePlan(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Continuous Compliance Monitoring Plan', 20, yPos);
        yPos += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Recommended continuous monitoring and compliance assurance measures:', 20, yPos);
        yPos += 10;

        const recommendations = [
            {
                title: 'Microsoft Defender for Cloud',
                items: [
                    'Enable Defender for Containers (P2)',
                    'Configure regulatory compliance dashboard',
                    'Set up security alerts for critical findings',
                    'Weekly review of Secure Score recommendations'
                ]
            },
            {
                title: 'Azure Policy',
                items: [
                    'Assign industry-specific policy initiatives',
                    'Enable audit/deny policies for critical controls',
                    'Configure compliance reporting',
                    'Monthly policy compliance review'
                ]
            },
            {
                title: 'Audit Logging & Monitoring',
                items: [
                    'Enable Azure Monitor Container Insights',
                    'Configure Log Analytics workspace',
                    'Set up audit log retention (90+ days)',
                    'Create alerts for security events'
                ]
            },
            {
                title: 'Vulnerability Management',
                items: [
                    'Enable container registry scanning',
                    'Configure automated patching policies',
                    'Monthly vulnerability assessments',
                    'Track and remediate high/critical CVEs'
                ]
            }
        ];

        recommendations.forEach(section => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.text(section.title, 20, yPos);
            yPos += 6;

            doc.setFont('helvetica', 'normal');
            section.items.forEach(item => {
                const lines = doc.splitTextToSize(`• ${item}`, 170);
                doc.text(lines, 25, yPos);
                yPos += lines.length * 5;
            });

            yPos += 8;
        });

        return yPos + 10;
    }

    /**
     * Add attestation page
     */
    addAttestationPage(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Compliance Attestation', 20, yPos);
        yPos += 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const attestationText = [
            'This document attests that the Azure Kubernetes Service Arc-enabled cluster',
            'described herein has been configured in accordance with applicable regulatory',
            'requirements and industry security best practices.',
            '',
            'The configurations and controls documented in this report have been verified',
            'against official regulatory framework requirements. All control mappings are',
            'sourced from authoritative publications and Microsoft compliance documentation.',
            '',
            'This deployment incorporates security controls designed to meet the compliance',
            'obligations specified for the selected industry and regulatory frameworks.'
        ];

        attestationText.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 6;
        });

        yPos += 20;

        // Signature blocks
        doc.setDrawColor(0);
        doc.line(20, yPos, 90, yPos);
        doc.line(110, yPos, 180, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'bold');
        doc.text('Deployment Engineer', 20, yPos);
        doc.text('Security/Compliance Officer', 110, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Signature', 20, yPos);
        doc.text('Signature', 110, yPos);
        yPos += 10;

        doc.line(20, yPos, 90, yPos);
        doc.line(110, yPos, 180, yPos);
        yPos += 5;

        doc.setFontSize(10);
        doc.text('Date: _______________', 20, yPos);
        doc.text('Date: _______________', 110, yPos);

        yPos += 30;

        // Document information
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text('Generated by: AKS Arc Deployment Tool', 20, yPos);
        yPos += 4;
        doc.text(`Report ID: ${this.generateReportId()}`, 20, yPos);
        yPos += 4;
        doc.text(`Generated: ${new Date().toISOString()}`, 20, yPos);
        yPos += 4;
        doc.text('Source: https://github.com/smitzlroy/aksarcdeployment', 20, yPos);

        return yPos;
    }

    /**
     * Add footers to all pages
     */
    addFooters(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text('CONFIDENTIAL - Compliance Documentation', 20, 285);
        }
    }

    /**
     * Helper: Get color based on score
     */
    getScoreColor(score) {
        if (score >= 90) return { r: 16, g: 124, b: 16 }; // Green
        if (score >= 75) return { r: 0, g: 120, b: 212 }; // Blue
        if (score >= 50) return { r: 255, g: 185, b: 0 }; // Orange
        return { r: 164, g: 38, b: 44 }; // Red
    }

    /**
     * Helper: Get rating text
     */
    getRatingText(rating) {
        const ratings = {
            'excellent': 'Excellent',
            'good': 'Good',
            'fair': 'Fair',
            'poor': 'Poor'
        };
        return ratings[rating] || rating;
    }

    /**
     * Helper: Generate report ID
     */
    generateReportId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        return `RPT-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Helper: Get date string for filename
     */
    getDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ComplianceReportGenerator = ComplianceReportGenerator;
}

console.log('✅ ComplianceReportGenerator loaded successfully');
